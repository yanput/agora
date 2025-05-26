"""Add cascade delete relationships

Revision ID: 1a31ce608336
Revises: d98dd8ec85a3
Create Date: 2024-07-31 22:24:34.447891
"""

from alembic import op
import sqlalchemy as sa

revision = '1a31ce608336'
down_revision = 'd98dd8ec85a3'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("item", recreate="always") as batch_op:
        batch_op.alter_column("owner_id", nullable=False, existing_type=sa.String(36))
        batch_op.drop_constraint("item_owner_id_fkey", type_="foreignkey")
        batch_op.create_foreign_key("item_owner_id_fkey", "user", ["owner_id"], ["id"], ondelete="CASCADE")


def downgrade():
    with op.batch_alter_table("item", recreate="always") as batch_op:
        batch_op.drop_constraint("item_owner_id_fkey", type_="foreignkey")
        batch_op.create_foreign_key("item_owner_id_fkey", "user", ["owner_id"], ["id"])
        batch_op.alter_column("owner_id", nullable=True, existing_type=sa.String(36))
