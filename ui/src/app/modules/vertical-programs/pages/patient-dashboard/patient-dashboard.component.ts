import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { AppState } from "src/app/store/reducers";
import { getCurrentUserDetails } from "src/app/store/selectors/current-user.selectors";
import { ActivatedRoute } from "@angular/router";
import { CurrentUser } from "src/app/shared/models/current-user.models";
import {
  ProgramenrollmentGetFull,
  WorkflowGetFull,
  WorkflowStateGetFull,
} from "src/app/shared/resources/openmrs";
import { map } from "rxjs/operators";
import { loadCurrentPatient } from "src/app/store/actions";
import { getCurrentPatient } from "src/app/store/selectors/current-patient.selectors";
import { ProgramsService } from "src/app/shared/resources/programs/services/programs.service";

@Component({
  selector: "app-patient-dashboard",
  templateUrl: "./patient-dashboard.component.html",
  styleUrls: ["./patient-dashboard.component.scss"],
})
export class PatientDashboardComponent implements OnInit {
  programs$: Observable<any>;
  enrollmentUuid: string;
  patientUuid: string;
  currentUser$: Observable<CurrentUser>;
  patientEnrollmentDetails$: Observable<ProgramenrollmentGetFull>;
  patient$: Observable<any>;
  selectedState: any;
  constructor(
    private store: Store<AppState>,
    private programService: ProgramsService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.enrollmentUuid = this.activatedRoute.snapshot.params["id"];
    this.patientUuid = this.activatedRoute.snapshot.params["patient"];

    this.currentUser$ = this.store.select(getCurrentUserDetails);
    this.store.dispatch(loadCurrentPatient({ uuid: this.patientUuid }));
    this.patient$ = this.store.select(getCurrentPatient);
    this.getEnrollmentDetails();
  }

  getEnrollmentDetails(): void {
    this.patientEnrollmentDetails$ = this.programService
      .getPatientEnrollmentDetails(this.enrollmentUuid)
      .pipe(
        map((enrollment: ProgramenrollmentGetFull) => {
          return {
            ...enrollment,
            program: {
              ...enrollment?.program,
              allWorkflows: enrollment?.program?.allWorkflows?.filter(
                (workFlow: WorkflowGetFull) => !workFlow?.retired
              ),
            },
          };
        })
      );
  }

  onSelectState(event: Event, state: WorkflowStateGetFull): void {
    event.stopPropagation();
    this.selectedState = state;
  }
}
