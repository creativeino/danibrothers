from sqlalchemy import TEXT, VARCHAR, Boolean, ForeignKey, Integer, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base, TimestampMixin, UUIDMixin

class Category(UUIDMixin, Base):
    __tablename__ = "categories"

    name: Mapped[str] = mapped_column(VARCHAR(120), nullable=False)
    slug: Mapped[str] = mapped_column(VARCHAR(120), nullable=False, unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    icon: Mapped[str] = mapped_column(VARCHAR(60), nullable=False, default="")
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    products: Mapped[list["Product"]] = relationship(back_populates="category")


class Product(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "products"

    name: Mapped[str] = mapped_column(VARCHAR(200), nullable=False)
    slug: Mapped[str] = mapped_column(VARCHAR(200), nullable=False, unique=True, index=True)
    brand: Mapped[str] = mapped_column(VARCHAR(100), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    price: Mapped[int] = mapped_column(Numeric(12, 2), nullable=False)
    compare_at_price: Mapped[int | None] = mapped_column(Numeric(12, 2), nullable=True)
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    condition: Mapped[str] = mapped_column(VARCHAR(20), nullable=False, default="NEW")
    # JSON strings: the API passes them through untouched so the admin forms
    # keep editing them as text, exactly like the frontend expects.
    images: Mapped[str] = mapped_column(TEXT, nullable=False, default="[]")
    specs: Mapped[str] = mapped_column(TEXT, nullable=False, default="[]")
    featured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    category_id: Mapped[str] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True
    )

    category: Mapped[Category] = relationship(back_populates="products")


class User(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "users"

    name: Mapped[str] = mapped_column(VARCHAR(120), nullable=False)
    email: Mapped[str] = mapped_column(VARCHAR(200), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(VARCHAR(200), nullable=False)
    phone: Mapped[str | None] = mapped_column(VARCHAR(30), nullable=True)
    role: Mapped[str] = mapped_column(VARCHAR(20), nullable=False, default="CUSTOMER")

    orders: Mapped[list["Order"]] = relationship(back_populates="user")


class Order(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "orders"

    order_number: Mapped[str] = mapped_column(VARCHAR(30), nullable=False, unique=True, index=True)
    user_id: Mapped[str | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    customer_name: Mapped[str] = mapped_column(VARCHAR(120), nullable=False)
    phone: Mapped[str] = mapped_column(VARCHAR(30), nullable=False)
    email: Mapped[str | None] = mapped_column(VARCHAR(200), nullable=True)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str] = mapped_column(VARCHAR(80), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    payment_method: Mapped[str] = mapped_column(VARCHAR(20), nullable=False, default="COD")
    # Bank-transfer receipts the customer attaches at checkout, stored as a
    # `/uploads/...` path — same convention as product photos, so a change of
    # API host never breaks a link already saved here.
    payment_proof: Mapped[str | None] = mapped_column(TEXT, nullable=True)
    subtotal: Mapped[int] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    shipping: Mapped[int] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    total: Mapped[int] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    status: Mapped[str] = mapped_column(VARCHAR(20), nullable=False, default="PENDING", index=True)

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan", lazy="selectin"
    )
    user: Mapped[User | None] = relationship(back_populates="orders")


class OrderItem(UUIDMixin, Base):
    __tablename__ = "order_items"

    order_id: Mapped[str] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Nullable: the row is a snapshot that survives product deletion.
    product_id: Mapped[str | None] = mapped_column(
        ForeignKey("products.id", ondelete="SET NULL"), nullable=True
    )
    name: Mapped[str] = mapped_column(VARCHAR(200), nullable=False)
    slug: Mapped[str] = mapped_column(VARCHAR(200), nullable=False)
    image: Mapped[str | None] = mapped_column(TEXT, nullable=True)
    price: Mapped[int] = mapped_column(Numeric(12, 2), nullable=False)
    qty: Mapped[int] = mapped_column(Integer, nullable=False)

    order: Mapped[Order] = relationship(back_populates="items")


class Inquiry(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "inquiries"

    type: Mapped[str] = mapped_column(VARCHAR(20), nullable=False, default="GENERAL")
    name: Mapped[str] = mapped_column(VARCHAR(120), nullable=False)
    phone: Mapped[str] = mapped_column(VARCHAR(30), nullable=False)
    email: Mapped[str | None] = mapped_column(VARCHAR(200), nullable=True)
    device: Mapped[str | None] = mapped_column(VARCHAR(200), nullable=True)
    condition: Mapped[str | None] = mapped_column(VARCHAR(20), nullable=True)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    handled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
