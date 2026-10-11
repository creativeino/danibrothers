"""Create tables and seed demo data.

Usage:  python -m app.seed
Idempotent: skips seeding when data already exists. Creates tables if missing.
The admin password comes from SEED_ADMIN_PASSWORD (default: admin12345).
"""

import json
import os

from passlib.context import CryptContext
from sqlalchemy import func, inspect, select, text

from .database import Base
from .deps import SessionLocal, engine
from .models import Category, Inquiry, Product, User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

CATEGORIES = [
    ("Laptops", "laptops", "New and certified pre-owned laptops from every major brand.", "laptop", 1),
    ("Desktop PCs", "desktop-pcs", "Tower PCs and all-in-ones for home, office and gaming.", "pc-case", 2),
    ("Monitors", "monitors", "IPS, VA and gaming monitors in every size.", "monitor", 3),
    ("Accessories", "accessories", "Keyboards, mice, docks and everyday peripherals.", "keyboard", 4),
    ("Storage", "storage", "SSDs, HDDs and flash drives for every budget.", "hard-drive", 5),
    ("Components", "components", "CPUs, GPUs, RAM and motherboards.", "cpu", 6),
    ("Audio", "audio", "Headsets and speakers for work and play.", "headphones", 7),
    ("Networking", "networking", "Routers, switches and cables.", "cable", 8),
    ("CCTV", "cctv", "Security cameras, DVRs and complete surveillance kits.", "cctv", 9),
]

PRODUCTS = [
    # name, brand, cat_slug, price, compare, stock, condition, featured, images, specs
    # `images` stays empty on purpose: photos are uploaded from the admin panel,
    # so the storefront never points at an image host we don't control.
    ("Dell Latitude 7420 14\" Business Laptop", "Dell", "laptops", 89999, 105000, 7, "REFURBISHED", True,
     [],
     [("CPU", "Core i5 1145G7"), ("RAM", "16GB"), ("Storage", "512GB NVMe"), ("Display", "14\" FHD")]),
    ("HP EliteBook 840 G8", "HP", "laptops", 94999, None, 5, "REFURBISHED", True,
     [],
     [("CPU", "Core i5 1135G7"), ("RAM", "8GB"), ("Storage", "256GB NVMe")]),
    ("MacBook Air M1 2020", "Apple", "laptops", 129999, 149999, 3, "USED", True,
     [],
     [("Chip", "Apple M1"), ("RAM", "8GB unified"), ("Storage", "256GB SSD")]),
    ("Lenovo ThinkPad T14 Gen 2", "Lenovo", "laptops", 87999, None, 9, "REFURBISHED", False,
     [],
     [("CPU", "Core i5 1135G7"), ("RAM", "16GB")]),
    ("Dell OptiPlex 7080 Micro", "Dell", "desktop-pcs", 54999, 62000, 6, "REFURBISHED", False,
     [],
     [("CPU", "Core i5 10500T"), ("RAM", "8GB"), ("Storage", "256GB SSD")]),
    ("Custom Gaming PC Ryzen 5 plus RTX 3060", "Custom Build", "desktop-pcs", 189999, None, 2, "NEW", True,
     [],
     [("CPU", "Ryzen 5 5600"), ("GPU", "RTX 3060 12GB"), ("RAM", "16GB DDR4"), ("Storage", "1TB NVMe")]),
    ("Dell UltraSharp U2723QE 27\" 4K", "Dell", "monitors", 112000, None, 4, "NEW", False,
     [],
     [("Panel", "IPS Black"), ("Resolution", "4K UHD"), ("Ports", "USB-C 90W")]),
    ("LG 24MK600M 24\" IPS", "LG", "monitors", 28999, 34000, 15, "NEW", False,
     [],
     [("Panel", "IPS"), ("Resolution", "1080p"), ("Refresh", "75Hz")]),
    ("Keychron K2 V2 Mechanical Keyboard", "Keychron", "accessories", 21999, None, 12, "NEW", True,
     [],
     [("Switches", "Gateron Brown"), ("Layout", "75%"), ("Connectivity", "Bluetooth / USB-C")]),
    ("Logitech MX Master 3S", "Logitech", "accessories", 18499, 21000, 20, "NEW", False,
     [],
     [("Sensor", "8000 DPI Darkfield"), ("Buttons", "7"), ("Battery", "70 days")]),
    ("Samsung 980 Pro 1TB NVMe", "Samsung", "storage", 18999, 22500, 25, "NEW", False,
     [],
     [("Capacity", "1TB"), ("Interface", "PCIe 4.0 x4"), ("Read", "7000 MB/s")]),
    ("WD Elements 2TB Portable HDD", "Western Digital", "storage", 10999, None, 30, "NEW", False,
     [],
     [("Capacity", "2TB"), ("Interface", "USB 3.0")]),
    ("AMD Ryzen 7 5800X", "AMD", "components", 38999, 44000, 8, "NEW", False,
     [],
     [("Cores", "8C/16T"), ("Boost", "4.7GHz"), ("Socket", "AM4")]),
    ("Corsair Vengeance LPX 16GB DDR4 3200", "Corsair", "components", 8499, None, 18, "NEW", False,
     [],
     [("Capacity", "16GB (2x8)"), ("Speed", "3200MHz")]),
    ("Sony WH-1000XM4 Wireless Headphones", "Sony", "audio", 44999, 52999, 6, "NEW", True,
     [],
     [("Type", "Over-ear ANC"), ("Battery", "30 hours")]),
    ("TP-Link Archer AX55 WiFi 6 Router", "TP-Link", "networking", 15999, 18000, 10, "NEW", False,
     [],
     [("Standard", "WiFi 6"), ("Speed", "AX3000"), ("Ports", "Gigabit x5")]),
    ("Hikvision DS-2CD2143G2 4MP Dome Camera", "Hikvision", "cctv", 13999, 16500, 14, "NEW", True,
     [],
     [("Resolution", "4MP"), ("Night Vision", "30m IR"), ("Rating", "IP67")]),
    ("Hikvision 4CH DVR Kit with 2 Cameras", "Hikvision", "cctv", 45999, 54000, 4, "NEW", True,
     [],
     [("Channels", "4"), ("Storage", "1TB HDD included"), ("Cameras", "2x 2MP bullet")]),
    ("Canon PIXMA G3010 All-in-One Printer", "Canon", "accessories", 27999, None, 5, "NEW", False,
     [],
     [("Type", "Ink tank"), ("Functions", "Print / Scan / Copy"), ("Wireless", "Yes")]),
    ("HP Pavilion x360 14 Touch", "HP", "laptops", 119999, 135000, 4, "NEW", False,
     [],
     [("CPU", "Core i5 1235U"), ("RAM", "8GB"), ("Storage", "512GB SSD"), ("Display", "14\" FHD touch")]),
    ("Dell P2422H 24\" FHD Monitor", "Dell", "monitors", 32999, None, 0, "NEW", False,
     [],
     [("Panel", "IPS"), ("Resolution", "1080p"), ("Stand", "Height adjustable")]),
    ("Corsair HS60 Pro Surround Headset", "Corsair", "audio", 11499, 13500, 0, "NEW", False,
     [],
     [("Type", "Over-ear wired"), ("Driver", "50mm neodymium")]),
]


def slugify(name: str) -> str:
    s = name.lower().replace('"', "").replace("+", "plus")
    out = []
    prev_dash = False
    for ch in s:
        if ch.isalnum():
            out.append(ch)
            prev_dash = False
        elif ch in " _" and not prev_dash:
            out.append("-")
            prev_dash = True
    return "".join(out).strip("-")[:80]


def pairs(specs: list[tuple[str, str]]) -> str:
    return json.dumps([{"label": label, "value": value} for label, value in specs])


# Columns added to a table that already exists. `create_all` only ever creates
# missing *tables*, so a new column on a live database needs this instead — the
# project has no migration tool, and this is a single nullable column.
ADDED_COLUMNS = {
    "orders": {"payment_proof": "TEXT"},
}


def sync_columns() -> None:
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    with engine.begin() as conn:
        for table, columns in ADDED_COLUMNS.items():
            if table not in existing_tables:
                continue  # create_all will build it with every column included.
            present = {c["name"] for c in inspector.get_columns(table)}
            for name, ddl_type in columns.items():
                if name not in present:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {ddl_type}"))
                    print(f"Added {table}.{name}")


def seed() -> None:
    Base.metadata.create_all(engine)
    sync_columns()

    with SessionLocal() as db:
        if db.scalar(select(func.count()).select_from(Category)):
            print("Database already has data - skipping seed.")
            return

        categories = {
            slug: Category(name=name, slug=slug, description=desc, icon=icon, sort_order=sort)
            for name, slug, desc, icon, sort in CATEGORIES
        }
        db.add_all(categories.values())
        db.flush()

        products = []
        for name, brand, cat_slug, price, compare, stock, condition, featured, images, specs in PRODUCTS:
            products.append(
                Product(
                    name=name,
                    slug=slugify(name),
                    brand=brand,
                    description=f"{name} sold and serviced by Dani Brothers. Tested in-store, "
                    "with honest grading and warranty on every device.",
                    price=price,
                    compare_at_price=compare,
                    stock=stock,
                    condition=condition,
                    images=json.dumps(images),
                    specs=pairs(specs),
                    featured=featured,
                    category_id=categories[cat_slug].id,
                )
            )
        db.add_all(products)

        admin = User(
            name="Dani Admin",
            email="admin@danibrothers.com",
            password_hash=pwd_context.hash(os.environ.get("SEED_ADMIN_PASSWORD", "admin12345")),
            phone="+92 345 291 6412",
            role="ADMIN",
        )
        customer = User(
            name="Ali Raza",
            email="ali@example.com",
            password_hash=pwd_context.hash("password123"),
            phone="03001234567",
            role="CUSTOMER",
        )
        db.add_all([admin, customer])
        db.flush()

        db.add_all(
            [
                Inquiry(
                    type="SELL_DEVICE",
                    name="Bilal Ahmed",
                    phone="03211234567",
                    email="bilal@example.com",
                    device="Dell Inspiron 15 3000",
                    condition="MINOR_FAULT",
                    message="Battery needs replacement, otherwise fine. What would you offer?",
                ),
                Inquiry(
                    type="REPAIR",
                    name="Sana Khan",
                    phone="03331234567",
                    email=None,
                    device="HP Pavilion gaming laptop",
                    condition=None,
                    message="Screen flickers after a few minutes of use. Is this repairable?",
                ),
                Inquiry(
                    type="BULK",
                    name="Fast Logistics Ltd",
                    phone="02134567890",
                    email="procurement@fastlogistics.pk",
                    device=None,
                    condition=None,
                    message="Need a quote for 15 office desktops and monitors.",
                ),
            ]
        )

        db.commit()
        print(f"Seeded {len(categories)} categories, {len(products)} products, admin account.")
        print("Admin login: admin@danibrothers.com / (SEED_ADMIN_PASSWORD or admin12345)")


if __name__ == "__main__":
    seed()
