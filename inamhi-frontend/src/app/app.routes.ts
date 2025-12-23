import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { TdrListaComponent } from './tdr-lista/tdr-lista';
import { TdrFormComponent } from './tdr-form/tdr-form';
import { MantenimientosComponent } from './mantenimientos/mantenimientos';
import { ContratosComponent } from './contratos/contratos';
import { ContratosFormComponent } from './contratos-form/contratos-form'; // <--- 1. Importar

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'tdr-lista', component: TdrListaComponent },
    { path: 'nuevo-tdr', component: TdrFormComponent },
    { path: 'mantenimientos', component: MantenimientosComponent },
    { path: 'contratos', component: ContratosComponent },
    { path: 'nuevo-contrato', component: ContratosFormComponent } // <--- 2. Nueva ruta
];