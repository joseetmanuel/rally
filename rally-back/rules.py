"""Calendario del Rally (bases): sólo cuentan los hechos ocurridos entre el inicio y el corte de puntos.

- Inicio: 1 de enero de 2026. Las certificaciones anteriores no cuentan.
- Corte: 15 de diciembre de 2026. Lo posterior no suma puntos.

Las fechas salen de la configuración (RALLY_START / RALLY_CUTOFF, ISO) para poder reutilizar la aplicación
en una siguiente edición sin tocar el código.
"""
from datetime import date

from flask import current_app


def window():
    return current_app.config['RALLY_START'], current_app.config['RALLY_CUTOFF']


def in_window(day):
    start, cutoff = window()
    return start <= day <= cutoff


def window_error(day, field):
    """Mensaje de error si `day` queda fuera del calendario del Rally; None si es válida."""
    start, cutoff = window()
    if day < start:
        return f'{field} cannot be before the rally start ({start.isoformat()})'
    if day > cutoff:
        return f'{field} cannot be after the points cutoff ({cutoff.isoformat()})'
    return None


def describe():
    start, cutoff = window()
    today = date.today()
    return {
        'start': start.isoformat(),
        'cutoff': cutoff.isoformat(),
        'closed': today > cutoff,
        'started': today >= start,
        # la última fecha que se puede registrar hoy: no es futura ni posterior al corte
        'max_registrable': min(today, cutoff).isoformat(),
    }
