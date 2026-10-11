from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from ..deps import get_db
from ..models import Category, Product
from ..schemas import PriceBounds, ProductListOut, ProductOut

router = APIRouter(prefix="/api", tags=["catalogue"])

SORTS = {
    "newest": Product.created_at.desc(),
    "price-asc": Product.price.asc(),
    "price-desc": Product.price.desc(),
    "name": Product.name.asc(),
}


def row_to_dict(product: Product) -> dict:
    cat = product.category
    return {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "brand": product.brand,
        "description": product.description,
        "price": float(product.price),
        "compareAtPrice": float(product.compare_at_price) if product.compare_at_price is not None else None,
        "stock": product.stock,
        "condition": product.condition,
        "images": product.images,
        "specs": product.specs,
        "featured": product.featured,
        "categoryId": product.category_id,
        "createdAt": product.created_at.isoformat(),
        "updatedAt": product.updated_at.isoformat(),
        "category": {"id": cat.id, "name": cat.name, "slug": cat.slug} if cat else None,
    }


def query_products(
    db: Session,
    *,
    categories: list[str] | None = None,
    brands: list[str] | None = None,
    conditions: list[str] | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    q: str | None = None,
    sort: str = "newest",
    featured: bool | None = None,
    page: int = 1,
    per_page: int = 12,
) -> ProductListOut:
    stmt = select(Product).options(selectinload(Product.category)).join(Category)
    if categories:
        stmt = stmt.where(Category.slug.in_(categories))
    if brands:
        stmt = stmt.where(Product.brand.in_(brands))
    if conditions:
        stmt = stmt.where(Product.condition.in_(conditions))
    if min_price is not None:
        stmt = stmt.where(Product.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Product.price <= max_price)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(
            Product.name.ilike(like)
            | Product.brand.ilike(like)
            | Product.description.ilike(like)
            | Category.name.ilike(like)
            | Category.slug.ilike(like)
        )
    if featured:
        stmt = stmt.where(Product.featured.is_(True))

    total = db.scalar(select(func.count()).select_from(stmt.subquery()))
    order_by = SORTS.get(sort, SORTS["newest"])
    page = max(1, page)
    per_page = max(1, min(per_page, 48))
    page_count = max(1, -(-(total or 0) // per_page))

    rows = db.scalars(stmt.order_by(order_by).offset((page - 1) * per_page).limit(per_page)).all()
    return ProductListOut(
        products=[ProductOut.model_validate(row_to_dict(p)) for p in rows],
        total=total or 0,
        page=page,
        perPage=per_page,
        pageCount=page_count,
    )


@router.get("/products")
def list_products(
    category: list[str] = Query(default=[]),
    brand: list[str] = Query(default=[]),
    condition: list[str] = Query(default=[]),
    min: float | None = Query(default=None, ge=0),
    max: float | None = Query(default=None, ge=0),
    q: str | None = None,
    sort: str = "newest",
    featured: bool | None = None,
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=12, ge=1, le=48),
    db: Session = Depends(get_db),
) -> ProductListOut:
    return query_products(
        db,
        categories=category,
        brands=brand,
        conditions=condition,
        min_price=min,
        max_price=max,
        q=q,
        sort=sort,
        featured=featured,
        page=page,
        per_page=per_page,
    )


@router.get("/products/featured")
def featured_products(
    take: int = Query(default=8, ge=1, le=24), db: Session = Depends(get_db)
) -> list[ProductOut]:
    rows = db.scalars(
        select(Product)
        .options(selectinload(Product.category))
        .where(Product.featured.is_(True))
        .order_by(Product.created_at.desc())
        .limit(take)
    ).all()
    return [ProductOut.model_validate(row_to_dict(p)) for p in rows]


@router.get("/products/price-bounds")
def price_bounds(db: Session = Depends(get_db)) -> PriceBounds:
    low, high = db.execute(select(func.min(Product.price), func.max(Product.price))).one()
    return PriceBounds(min=float(low or 0), max=float(high or 0))


@router.get("/products/slugs")
def product_slugs(db: Session = Depends(get_db)) -> list[str]:
    return list(db.scalars(select(Product.slug).order_by(Product.slug)))


@router.get("/products/related")
def related_products(
    category_id: str,
    exclude: str | None = None,
    take: int = Query(default=4, ge=1, le=12),
    db: Session = Depends(get_db),
) -> list[ProductOut]:
    stmt = (
        select(Product)
        .options(selectinload(Product.category))
        .where(Product.category_id == category_id)
    )
    if exclude:
        stmt = stmt.where(Product.id != exclude)
    rows = db.scalars(stmt.order_by(Product.created_at.desc()).limit(take)).all()
    return [ProductOut.model_validate(row_to_dict(p)) for p in rows]


@router.get("/products/{slug}")
def product_by_slug(slug: str, db: Session = Depends(get_db)) -> ProductOut:
    product = db.scalar(
        select(Product).options(selectinload(Product.category)).where(Product.slug == slug)
    )
    if product is None:
        raise HTTPException(status_code=404, detail={"message": "Product not found."})
    return ProductOut.model_validate(row_to_dict(product))


@router.get("/search")
def search(q: str = Query(min_length=1), db: Session = Depends(get_db)) -> dict:
    listing = query_products(db, q=q, per_page=8)
    return {"products": [p.model_dump() for p in listing.products]}


@router.get("/categories")
def categories(db: Session = Depends(get_db)) -> list[dict]:
    rows = db.execute(
        select(Category, func.count(Product.id))
        .outerjoin(Product, Product.category_id == Category.id)
        .group_by(Category.id)
        .order_by(Category.sort_order)
    ).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "slug": c.slug,
            "description": c.description,
            "icon": c.icon,
            "sortOrder": c.sort_order,
            "productCount": count,
        }
        for c, count in rows
    ]


@router.get("/brands")
def brands(db: Session = Depends(get_db)) -> list[str]:
    return list(db.scalars(select(Product.brand).distinct().order_by(Product.brand)))
