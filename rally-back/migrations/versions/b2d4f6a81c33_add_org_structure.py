"""add org structure (cto, directions, subdirections, managements)

Estructura jerárquica CTO -> Dirección -> Subdirección -> Gerencia. El participante pertenece a una gerencia
(consultants.management_id, opcional en la base para no romper a quienes ya existen; el alta lo pide).

Revision ID: b2d4f6a81c33
Revises: a1c3e5f70b21
Create Date: 2026-10-12 20:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'b2d4f6a81c33'
down_revision = 'a1c3e5f70b21'
branch_labels = None
depends_on = None


def _unit_columns():
    return [
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('head_name', sa.String(length=150), nullable=False, server_default=''),
        sa.Column('head_consultant_id', sa.Integer(), nullable=True),
    ]


def upgrade():
    op.create_table('ctos', *_unit_columns(),
        sa.ForeignKeyConstraint(['head_consultant_id'], ['consultants.id']),
        sa.PrimaryKeyConstraint('id'))
    op.create_table('directions', *_unit_columns(),
        sa.Column('cto_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['cto_id'], ['ctos.id']),
        sa.ForeignKeyConstraint(['head_consultant_id'], ['consultants.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('cto_id', 'name', name='uq_directions_cto_name'))
    op.create_table('subdirections', *_unit_columns(),
        sa.Column('direction_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['direction_id'], ['directions.id']),
        sa.ForeignKeyConstraint(['head_consultant_id'], ['consultants.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('direction_id', 'name', name='uq_subdirections_direction_name'))
    op.create_table('managements', *_unit_columns(),
        sa.Column('subdirection_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['subdirection_id'], ['subdirections.id']),
        sa.ForeignKeyConstraint(['head_consultant_id'], ['consultants.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('subdirection_id', 'name', name='uq_managements_subdirection_name'))

    with op.batch_alter_table('consultants', schema=None) as batch_op:
        batch_op.add_column(sa.Column('management_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_consultants_management_id', 'managements', ['management_id'], ['id'])


def downgrade():
    with op.batch_alter_table('consultants', schema=None) as batch_op:
        batch_op.drop_constraint('fk_consultants_management_id', type_='foreignkey')
        batch_op.drop_column('management_id')
    op.drop_table('managements')
    op.drop_table('subdirections')
    op.drop_table('directions')
    op.drop_table('ctos')
