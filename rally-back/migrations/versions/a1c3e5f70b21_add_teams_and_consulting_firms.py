"""add teams and consulting firms catalogs

Reemplaza consultants.team_number (entero) y consultants.consulting_firm_name (texto libre)
por claves foráneas a los catálogos teams y consulting_firms, conservando los datos existentes.

Revision ID: a1c3e5f70b21
Revises: 222ada74f841
Create Date: 2026-10-06 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a1c3e5f70b21'
down_revision = '222ada74f841'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('teams',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'))
    op.create_table('consulting_firms',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'))

    with op.batch_alter_table('consultants', schema=None) as batch_op:
        batch_op.add_column(sa.Column('team_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('consulting_firm_id', sa.Integer(), nullable=True))

    # Conservar datos: las consultoras en texto libre pasan al catálogo y los consultores
    # existentes quedan en el equipo 'N/A' (el número de equipo anterior no tiene equivalente).
    # 'N/A' sólo se crea si hay consultores que migrar; en una base nueva no se crea ningún equipo
    op.execute("INSERT INTO teams (name) SELECT 'N/A' WHERE EXISTS (SELECT 1 FROM consultants)")
    op.execute("UPDATE consultants SET team_id = (SELECT id FROM teams WHERE name = 'N/A')")  # no-op sin filas
    op.execute("""
        INSERT INTO consulting_firms (name)
        SELECT DISTINCT TRIM(consulting_firm_name) FROM consultants
        WHERE consulting_firm_name IS NOT NULL AND TRIM(consulting_firm_name) <> ''
    """)
    op.execute("""
        UPDATE consultants SET consulting_firm_id = f.id
        FROM consulting_firms f WHERE f.name = TRIM(consultants.consulting_firm_name)
    """)

    with op.batch_alter_table('consultants', schema=None) as batch_op:
        batch_op.alter_column('team_id', nullable=False)
        batch_op.create_foreign_key('fk_consultants_team_id', 'teams', ['team_id'], ['id'])
        batch_op.create_foreign_key('fk_consultants_consulting_firm_id', 'consulting_firms',
                                    ['consulting_firm_id'], ['id'])
        batch_op.drop_column('team_number')
        batch_op.drop_column('consulting_firm_name')


def downgrade():
    with op.batch_alter_table('consultants', schema=None) as batch_op:
        batch_op.add_column(sa.Column('team_number', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('consulting_firm_name', sa.String(length=255), nullable=True))

    op.execute("""
        UPDATE consultants SET consulting_firm_name = f.name
        FROM consulting_firms f WHERE f.id = consultants.consulting_firm_id
    """)
    op.execute("UPDATE consultants SET team_number = 1")

    with op.batch_alter_table('consultants', schema=None) as batch_op:
        batch_op.alter_column('team_number', nullable=False)
        batch_op.drop_constraint('fk_consultants_consulting_firm_id', type_='foreignkey')
        batch_op.drop_constraint('fk_consultants_team_id', type_='foreignkey')
        batch_op.drop_column('consulting_firm_id')
        batch_op.drop_column('team_id')

    op.drop_table('consulting_firms')
    op.drop_table('teams')
