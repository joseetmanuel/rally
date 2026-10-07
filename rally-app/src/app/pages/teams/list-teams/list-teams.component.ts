import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TeamService } from '../../../core/services/teams/team.service';
import { Team } from '../../../core/models/teams/team';
import { CaptureTeamComponent } from '../capture-team/capture-team.component';
import { ConfirmationService } from '../../../core/services/confirmation/confirmation.service';

@Component({
  selector: 'app-list-teams',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './list-teams.component.html',
  styleUrls: ['./list-teams.component.scss']
})
export class ListTeamsComponent implements OnInit {
  teams: Team[] = [];
  displayedColumns: string[] = ['name', 'actions'];
  errorMessage = '';

  private teamService = inject(TeamService);
  private dialog = inject(MatDialog);
  private confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.errorMessage = '';
    this.teamService.getTeams().subscribe({
      next: (data) => this.teams = data,
      error: (err) => {
        console.error('Error loading teams', err);
        this.errorMessage = err?.error?.error || 'No se pudieron cargar los equipos.';
      }
    });
  }

  openCaptureDialog(team?: Team): void {
    const dialogRef = this.dialog.open(CaptureTeamComponent, {
      width: '400px',
      data: team || null,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTeams();
      }
    });
  }

  deleteTeam(team: Team): void {
    if (!team.id) return;

    this.confirmationService.openDeleteConfirmation().subscribe(result => {
      if (result) {
        this.errorMessage = '';
        this.teamService.deleteTeam(team.id!).subscribe({
          next: () => this.loadTeams(),
          error: (err) => {
            console.error('Error deleting team', err);
            this.errorMessage = err?.error?.error || 'No se pudo eliminar el equipo.';
          }
        });
      }
    });
  }
}
