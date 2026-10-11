"""add academic hierarchy and multi-period attendance

Revision ID: a1b2c3d4e5f6
Revises: 7c9e1f4b2a81
Create Date: 2026-10-05 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '7c9e1f4b2a81'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Ensure subjects table exists
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    if "subjects" not in tables:
        op.create_table(
            'subjects',
            sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
            sa.Column('code', sa.String(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('branch', sa.String(), nullable=False, server_default='CSE'),
            sa.Column('year', sa.Integer(), nullable=False, server_default='3'),
            sa.Column('semester', sa.Integer(), nullable=False, server_default='6'),
            sa.Column('created_at', sa.DateTime(), nullable=True),
        )
        op.create_index('ix_subjects_id', 'subjects', ['id'], unique=False)
        op.create_index('ix_subjects_code', 'subjects', ['code'], unique=False)

    # 2. Ensure students table exists
    if "students" not in tables:
        op.create_table(
            'students',
            sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
            sa.Column('usn', sa.String(), nullable=False),
            sa.Column('full_name', sa.String(), nullable=False),
            sa.Column('email', sa.String(), nullable=False),
            sa.Column('branch', sa.String(), nullable=False, server_default='CSE'),
            sa.Column('year', sa.Integer(), nullable=False, server_default='3'),
            sa.Column('semester', sa.Integer(), nullable=False, server_default='6'),
            sa.Column('section', sa.String(), nullable=False, server_default='A'),
            sa.Column('class_code', sa.String(), nullable=True, server_default='BCS703 — Cryptography & Network Security'),
            sa.Column('user_id', sa.Integer(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        )
        op.create_index('ix_students_id', 'students', ['id'], unique=False)
        op.create_index('ix_students_usn', 'students', ['usn'], unique=True)
        op.create_index('ix_students_email', 'students', ['email'], unique=True)
        op.create_index('ix_students_user_id', 'students', ['user_id'], unique=False)

    # 3. Add subject_id and period to attendance table if not present
    attendance_cols = [c['name'] for c in inspector.get_columns('attendance')] if 'attendance' in tables else []
    
    with op.batch_alter_table('attendance', schema=None) as batch_op:
        if 'subject_id' not in attendance_cols:
            batch_op.add_column(sa.Column('subject_id', sa.Integer(), nullable=True))
            batch_op.create_foreign_key('fk_attendance_subject_id', 'subjects', ['subject_id'], ['id'], ondelete='SET NULL')
            batch_op.create_index('ix_attendance_subject_id', ['subject_id'], unique=False)
        if 'period' not in attendance_cols:
            batch_op.add_column(sa.Column('period', sa.Integer(), nullable=True, server_default='1'))
        
        # Upgrade unique constraint to (user_id, date, subject_id, period)
        try:
            batch_op.drop_constraint('uq_attendance_user_date', type_='unique')
        except Exception:
            pass
        try:
            batch_op.create_unique_constraint(
                'uq_attendance_user_date_subject_period',
                ['user_id', 'date', 'subject_id', 'period']
            )
        except Exception:
            pass


def downgrade() -> None:
    with op.batch_alter_table('attendance', schema=None) as batch_op:
        try:
            batch_op.drop_constraint('uq_attendance_user_date_subject_period', type_='unique')
            batch_op.create_unique_constraint('uq_attendance_user_date', ['user_id', 'date'])
        except Exception:
            pass
        try:
            batch_op.drop_index('ix_attendance_subject_id')
            batch_op.drop_column('subject_id')
            batch_op.drop_column('period')
        except Exception:
            pass
