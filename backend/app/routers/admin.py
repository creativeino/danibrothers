import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from ..config import settings
from ..deps import get_db
from ..models import Category, Inquiry, Order, Product, User
from ..uploads import UPLOAD_DIR, save_image
from ..schemas import (
    AdminStats,
    InquiryListOut,
    InquiryOut,
    OrderListOut,
    OrderOut,
    ProductCreate,
    ProductOut,
    StatusIn,
    StockIn,
)
from ..routers.catalog import row_to_dict
from ..routers.orders import order_to_dict
from ..security import require_admin


def inquiry_to_dict(i: Inquiry) -> dict:
    return {
        "id": i.id,
        "type": i.type,
        "name": i.name,
        "phone": i.phone,
        "email": i.email,
        "device": i.device,
        "condition": i.condition,
        "message": i.message,
        "handled": i.handled,
        "createdAt": i.created_at.isoformat(),
    }

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])


def slug_conflict() -> HTTPException:
    return HTTPException(
        status_code=409,
        detail={
            "message": "A product with that slug already exists.",
            "fieldErrors": {"slug": "That URL is taken — try a slightly different name."},
        },
    )


def category_exists(db: Session, category_id: str) -> bool:
    try:
        cid = str(uuid.UUID(category_id))
    except ValueError:
        return False
    return db.get(Category, cid) is not None


def get_product(db: Session, product_id: str) -> Product:
    try:
        pid = str(uuid.UUID(product_id))
    except ValueError:
        raise HTTPException(status_code=404, detail={"message": "Product not found."})
    product = db.scalar(
        select(Product).options(selectinload(Product.category)).where(Product.id == pid)
    )
    if product is None:
        raise HTTPException(status_code=404, detail={"message": "Product not found."})
    return product


def get_order(db: Session, order_id: str) -> Order:
    try:
        oid = str(uuid.UUID(order_id))
    except ValueError:
        raise HTTPException(status_code=404, detail={"message": "Order not found."})
    order = db.scalar(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.user))
        .where(Order.id == oid)
    )
    if order is None:
        raise HTTPException(status_code=404, detail={"message": "Order not found."})
    return order


@router.get("/products")
def admin_products(
    q: str | None = None,
    category: str | None = None,
    filter: str | None = None,
    page: int = Query(default=1, ge=1),
    db: Session = Depends(get_db),
) -> dict:
    stmt = select(Product).join(Category, Product.category_id == Category.id)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(Product.name.ilike(like) | Product.brand.ilike(like))
    if category:
        stmt = stmt.where(Category.slug == category)
    if filter == "low":
        stmt = stmt.where(Product.stock <= settings.low_stock_threshold)

    total = db.scalar(select(func.count()).select_from(stmt.subquery()))
    per_page = 20
    page_count = max(1, -(-(total or 0) // per_page))
    rows = db.scalars(
        stmt.options(selectinload(Product.category))
        .order_by(Product.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    ).all()
    return {
        "products": [ProductOut.model_validate(row_to_dict(p)) for p in rows],
        "total": total or 0,
        "page": page,
        "pageCount": page_count,
    }


@router.post("/uploads", status_code=201)
async def upload_image(file: UploadFile = File(...)) -> dict:
    return await save_image(file)


@router.get("/products/{product_id}")
def admin_product(product_id: str, db: Session = Depends(get_db)) -> ProductOut:
    # The edit form reads one product back; without this the PATCH route
    # answers GET with a 405 and every edit page dies before it renders.
    return ProductOut.model_validate(row_to_dict(get_product(db, product_id)))


@router.post("/products", status_code=201)
def create_product(data: ProductCreate, db: Session = Depends(get_db)) -> ProductOut:
    if not category_exists(db, data.categoryId):
        raise HTTPException(
            status_code=400,
            detail={"message": "Pick a valid category.", "fieldErrors": {"categoryId": "Pick a category."}},
        )
    if db.scalar(select(Product).where(Product.slug == data.slug)):
        raise slug_conflict()
    product = Product(
        name=data.name,
        slug=data.slug,
        brand=data.brand,
        description=data.description,
        price=data.price,
        compare_at_price=data.compareAtPrice,
        stock=data.stock,
        condition=data.condition,
        images=data.images,
        specs=data.specs,
        featured=data.featured,
        category_id=data.categoryId,
    )
    db.add(product)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise slug_conflict()
    db.refresh(product, ["category"])
    return ProductOut.model_validate(row_to_dict(product))


@router.patch("/products/{product_id}")
def update_product(
    product_id: str, data: ProductCreate, db: Session = Depends(get_db)
) -> ProductOut:
    product = get_product(db, product_id)
    if not category_exists(db, data.categoryId):
        raise HTTPException(
            status_code=400,
            detail={"message": "Pick a valid category.", "fieldErrors": {"categoryId": "Pick a category."}},
        )
    clash = db.scalar(select(Product).where(Product.slug == data.slug, Product.id != product.id))
    if clash:
        raise slug_conflict()

    product.name = data.name
    product.slug = data.slug
    product.brand = data.brand
    product.description = data.description
    product.price = data.price
    product.compare_at_price = data.compareAtPrice
    product.stock = data.stock
    product.condition = data.condition
    product.images = data.images
    product.specs = data.specs
    product.featured = data.featured
    product.category_id = data.categoryId
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise slug_conflict()
    db.refresh(product, ["category"])
    return ProductOut.model_validate(row_to_dict(product))


@router.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: str, db: Session = Depends(get_db)) -> None:
    product = get_product(db, product_id)
    db.delete(product)
    db.commit()


@router.patch("/products/{product_id}/featured")
def toggle_featured(product_id: str, db: Session = Depends(get_db)) -> dict:
    product = get_product(db, product_id)
    product.featured = not product.featured
    db.commit()
    return {"id": product.id, "slug": product.slug, "featured": product.featured}


@router.patch("/products/{product_id}/stock")
def set_stock(product_id: str, data: StockIn, db: Session = Depends(get_db)) -> dict:
    product = get_product(db, product_id)
    product.stock = data.stock
    db.commit()
    return {"id": product.id, "stock": product.stock}


@router.get("/orders")
def admin_orders(
    status: str | None = None,
    q: str | None = None,
    page: int = Query(default=1, ge=1),
    db: Session = Depends(get_db),
) -> OrderListOut:
    stmt = select(Order)
    if status:
        stmt = stmt.where(Order.status == status)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(
            Order.order_number.ilike(like)
            | Order.customer_name.ilike(like)
            | Order.phone.ilike(like)
        )
    total = db.scalar(select(func.count()).select_from(stmt.subquery()))
    per_page = 20
    page_count = max(1, -(-(total or 0) // per_page))
    rows = db.scalars(
        stmt.options(selectinload(Order.items), selectinload(Order.user))
        .order_by(Order.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
    ).all()
    status_counts = dict(db.execute(select(Order.status, func.count()).group_by(Order.status)).all())
    return OrderListOut(
        orders=[OrderOut.model_validate(order_to_dict(o)) for o in rows],
        total=total or 0,
        page=page,
        pageCount=page_count,
        byStatus=status_counts,
    )


@router.get("/orders/{order_id}")
def admin_order(order_id: str, db: Session = Depends(get_db)) -> OrderOut:
    order = get_order(db, order_id)
    # Admin detail wants live product info alongside the snapshot.
    product_ids = [i.product_id for i in order.items if i.product_id]
    live = {}
    if product_ids:
        live = {p.id: p for p in db.scalars(select(Product).where(Product.id.in_(product_ids)))}
    d = order_to_dict(order)
    for item in d["items"]:
        p = live.get(item["productId"]) if item["productId"] else None
        item["productSlug"] = p.slug if p else None
        item["productStock"] = p.stock if p else None
    return OrderOut.model_validate(d)


@router.patch("/orders/{order_id}/status")
def update_order_status(
    order_id: str, data: StatusIn, db: Session = Depends(get_db)
) -> OrderOut:
    order = get_order(db, order_id)
    order.status = data.status
    db.commit()
    return OrderOut.model_validate(order_to_dict(order))


@router.get("/inquiries")
def admin_inquiries(show: str = "open", db: Session = Depends(get_db)) -> InquiryListOut:
    handled = show == "handled"
    rows = db.scalars(
        select(Inquiry).where(Inquiry.handled.is_(handled)).order_by(Inquiry.created_at.desc())
    ).all()
    open_count = db.scalar(select(func.count()).select_from(select(Inquiry).where(Inquiry.handled.is_(False)).subquery()))
    handled_count = db.scalar(select(func.count()).select_from(select(Inquiry).where(Inquiry.handled.is_(True)).subquery()))
    return InquiryListOut(
        inquiries=[InquiryOut.model_validate(inquiry_to_dict(i)) for i in rows],
        openCount=open_count or 0,
        handledCount=handled_count or 0,
    )


@router.patch("/inquiries/{inquiry_id}/toggle")
def toggle_inquiry(inquiry_id: str, db: Session = Depends(get_db)) -> dict:
    try:
        iid = str(uuid.UUID(inquiry_id))
    except ValueError:
        raise HTTPException(status_code=404, detail={"message": "Inquiry not found."})
    inquiry = db.get(Inquiry, iid)
    if inquiry is None:
        raise HTTPException(status_code=404, detail={"message": "Inquiry not found."})
    inquiry.handled = not inquiry.handled
    db.commit()
    return {"id": inquiry.id, "handled": inquiry.handled}


@router.get("/stats")
def admin_stats(db: Session = Depends(get_db)) -> AdminStats:
    product_count = db.scalar(select(func.count()).select_from(Product))
    out_of_stock = db.scalar(select(func.count()).select_from(select(Product).where(Product.stock == 0).subquery()))
    low_stock = db.scalar(
        select(func.count()).select_from(
            select(Product).where(Product.stock > 0, Product.stock <= settings.low_stock_threshold).subquery()
        )
    )
    order_count = db.scalar(select(func.count()).select_from(Order))
    customer_count = db.scalar(select(func.count()).select_from(User))
    revenue = db.scalar(select(func.coalesce(func.sum(Order.total), 0)).where(Order.status != "CANCELLED"))
    open_inquiries = db.scalar(select(func.count()).select_from(select(Inquiry).where(Inquiry.handled.is_(False)).subquery()))
    by_status = dict(db.execute(select(Order.status, func.count()).group_by(Order.status)).all())
    recent = db.scalars(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.user))
        .order_by(Order.created_at.desc())
        .limit(5)
    ).all()
    return AdminStats(
        productCount=product_count or 0,
        outOfStock=out_of_stock or 0,
        lowStock=low_stock or 0,
        orderCount=order_count or 0,
        customerCount=customer_count or 0,
        revenue=float(revenue or 0),
        openInquiries=open_inquiries or 0,
        byStatus=by_status,
        recentOrders=[OrderOut.model_validate(order_to_dict(o)) for o in recent],
    )
