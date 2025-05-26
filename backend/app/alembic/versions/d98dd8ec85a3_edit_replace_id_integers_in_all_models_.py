"""Edit replace id integers in all models to use UUID instead

Revision ID: d98dd8ec85a3
Revises: 9c0a54914c78
Create Date: 2024-07-19 04:08:04.000976
"""

from alembic import op
import sqlalchemy as sa
import uuid


revision = 'd98dd8ec85a3'
down_revision = '9c0a54914c78'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    user_columns = [col["name"] for col in inspector.get_columns("user")]
    item_columns = [col["name"] for col in inspector.get_columns("item")]

    op.add_column('user', sa.Column('new_id', sa.String(36), nullable=True))
    op.add_column('item', sa.Column('new_id', sa.String(36), nullable=True))
    op.add_column('item', sa.Column('new_owner_id', sa.String(36), nullable=True))

    users = conn.execute(sa.text('SELECT id FROM "user"')).fetchall()
    user_id_map = {}
    for row in users:
        new_id = str(uuid.uuid4())
        user_id_map[row.id] = new_id
        conn.execute(sa.text('UPDATE "user" SET new_id = :new_id WHERE id = :id'),
                     {"new_id": new_id, "id": row.id})

    items = conn.execute(sa.text('SELECT id, owner_id FROM item')).fetchall()
    for row in items:
        new_id = str(uuid.uuid4())
        new_owner_id = user_id_map.get(row.owner_id)
        conn.execute(sa.text(
            'UPDATE item SET new_id = :new_id, new_owner_id = :new_owner_id WHERE id = :id'
        ), {"new_id": new_id, "new_owner_id": new_owner_id, "id": row.id})

    fk_names = [fk["name"] for fk in inspector.get_foreign_keys("item")]
    if "item_owner_id_fkey" in fk_names:
        with op.batch_alter_table("item", recreate="always") as batch_op:
            batch_op.drop_constraint("item_owner_id_fkey", type_="foreignkey")
            batch_op.drop_column("owner_id")
            batch_op.alter_column("new_owner_id", new_column_name="owner_id")
    else:
        with op.batch_alter_table("item", recreate="always") as batch_op:
            batch_op.drop_column("owner_id")
            batch_op.alter_column("new_owner_id", new_column_name="owner_id")

    with op.batch_alter_table("user", recreate="always") as batch_op:
        batch_op.drop_column("id")
        batch_op.alter_column("new_id", new_column_name="id")
        batch_op.create_primary_key("user_pkey", ["id"])

    with op.batch_alter_table("item", recreate="always") as batch_op:
        batch_op.drop_column("id")
        batch_op.alter_column("new_id", new_column_name="id")
        batch_op.create_primary_key("item_pkey", ["id"])
        batch_op.create_foreign_key("item_owner_id_fkey", "user", ["owner_id"], ["id"])


def downgrade():
    pass
