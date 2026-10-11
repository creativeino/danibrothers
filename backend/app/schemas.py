from datetime import datetime
from typing import Any, Literal

from pydantic import AliasChoices, BaseModel, ConfigDict, EmailStr, Field, field_validator

# Upload paths the API itself hands out. Anything else in `paymentProof` would
# be stored and later rendered as a link, so the value is pinned to that shape.
UPLOAD_PATH_RE = r"^/uploads/[A-Za-z0-9._-]+$"

INQUIRY_TYPES = ("SELL_DEVICE", "GENERAL", "REPAIR", "BULK")
DEVICE_CONDITIONS = ("WORKING", "MINOR_FAULT", "FAULTY", "UNKNOWN")
ORDER_STATUSES = ("PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED")
CONDITIONS = ("NEW", "REFURBISHED", "USED")
PAYMENT_METHODS = ("COD", "BANK_TRANSFER")


# --- Auth -----------------------------------------------------------------

class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)
    phone: str | None = Field(default=None, max_length=30)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class AuthOut(BaseModel):
    token: str
    user: dict[str, str]


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    passwordHash: str
    phone: str | None
    role: str
    createdAt: datetime


# --- Categories ------------------------------------------------------------

class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str
    description: str
    icon: str
    sortOrder: int
    productCount: int = 0


# --- Products --------------------------------------------------------------

class ProductCreate(BaseModel):
    id: str | None = None
    name: str = Field(min_length=3, max_length=200)
    slug: str = Field(min_length=1, max_length=200)
    brand: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=20)
    price: int = Field(ge=0)
    compareAtPrice: int | None = Field(default=None, ge=0)
    stock: int = Field(ge=0)
    condition: Literal["NEW", "REFURBISHED", "USED"] = "NEW"
    featured: bool = False
    categoryId: str
    # JSON-encoded strings, stored verbatim.
    images: str = "[]"
    specs: str = "[]"

    @field_validator("images", "specs")
    @classmethod
    def must_be_json_array(cls, v: str) -> str:
        import json

        try:
            parsed = json.loads(v)
        except json.JSONDecodeError as e:
            raise ValueError("Must be valid JSON") from e
        if not isinstance(parsed, list):
            raise ValueError("Must be a JSON array")
        return v


class ProductUpdate(ProductCreate):
    pass


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str
    brand: str
    description: str
    price: float
    compareAtPrice: float | None
    stock: int
    condition: str
    images: str
    specs: str
    featured: bool
    categoryId: str
    createdAt: datetime
    updatedAt: datetime
    category: dict[str, str] | None = None


class ProductListOut(BaseModel):
    products: list[ProductOut]
    total: int
    page: int
    perPage: int
    pageCount: int


class PriceBounds(BaseModel):
    min: float
    max: float


# --- Inquiries -------------------------------------------------------------

class InquiryIn(BaseModel):
    type: Literal["SELL_DEVICE", "GENERAL", "REPAIR", "BULK"] = "GENERAL"
    name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=7, max_length=30)
    email: EmailStr | None = None
    device: str | None = Field(default=None, max_length=200)
    condition: Literal["WORKING", "MINOR_FAULT", "FAULTY", "UNKNOWN"] | None = None
    message: str = Field(min_length=5, max_length=4000)


class InquiryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    type: str
    name: str
    phone: str
    email: str | None
    device: str | None
    condition: str | None
    message: str | None
    handled: bool
    createdAt: datetime


class InquiryListOut(BaseModel):
    inquiries: list[InquiryOut]
    openCount: int
    handledCount: int


# --- Orders ----------------------------------------------------------------

class CartEntry(BaseModel):
    productId: str
    qty: int = Field(ge=1, le=99)


class OrderIn(BaseModel):
    cart: list[CartEntry] = Field(min_length=1)
    customerName: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=7, max_length=30)
    email: EmailStr | None = None
    address: str = Field(min_length=5, max_length=500)
    city: str = Field(min_length=2, max_length=80)
    notes: str | None = Field(default=None, max_length=2000)
    paymentMethod: Literal["COD", "BANK_TRANSFER"] = "COD"
    # Set only for bank transfers: the `/uploads/...` path of the receipt the
    # customer attached at checkout.
    paymentProof: str | None = Field(default=None, max_length=300, pattern=UPLOAD_PATH_RE)


class OrderItemOut(BaseModel):
    id: str
    productId: str | None
    name: str
    slug: str
    image: str | None
    price: float
    qty: int
    productSlug: str | None = None
    productStock: int | None = None


class OrderOut(BaseModel):
    id: str
    orderNumber: str
    userId: str | None
    customerName: str
    phone: str
    email: str | None
    address: str
    city: str
    notes: str | None
    paymentMethod: str
    paymentProof: str | None = None
    subtotal: float
    shipping: float
    total: float
    status: str
    createdAt: datetime
    updatedAt: datetime
    items: list[OrderItemOut]
    itemCount: int
    user: dict[str, str] | None = None


class OrderListOut(BaseModel):
    orders: list[OrderOut]
    total: int
    page: int
    pageCount: int
    byStatus: dict[str, int]


class StatusIn(BaseModel):
    status: Literal["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]


class StockIn(BaseModel):
    stock: int = Field(ge=0)


# --- Admin -----------------------------------------------------------------

class AdminStats(BaseModel):
    productCount: int
    outOfStock: int
    lowStock: int
    orderCount: int
    customerCount: int
    revenue: float
    openInquiries: int
    byStatus: dict[str, int]
    recentOrders: list[OrderOut]
