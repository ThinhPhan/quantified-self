import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnInit} from '@angular/core';
import {EventInterface} from 'quantified-self-lib/lib/events/event.interface';
import {EventService} from '../../services/app.event.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import * as Sentry from '@sentry/browser';
import {ActivityInterface} from 'quantified-self-lib/lib/activities/activity.interface';
import {EventUtilities} from 'quantified-self-lib/lib/events/utilities/event.utilities';
import {activityDistanceValidator} from './activity.form.distance.validator';
import {User} from 'quantified-self-lib/lib/users/user';
import {take} from "rxjs/operators";
import {Log} from "ng2-logger/browser";
import {DataDistance} from "quantified-self-lib/lib/data/data.distance";


@Component({
  selector: 'app-activity-form',
  templateUrl: './activity.form.component.html',
  styleUrls: ['./activity.form.component.css'],
  providers: [],
})


export class ActivityFormComponent implements OnInit {
  protected logger = Log.create('ActivityFormComponent');

  public activity: ActivityInterface;
  public event: EventInterface;
  public user: User;

  public activityFormGroup: FormGroup;

  public isLoading: boolean;

  constructor(
    public dialogRef: MatDialogRef<ActivityFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private eventService: EventService,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
  ) {
    this.activity = data.activity;
    this.event = data.event;
    this.user = data.user;
  }

  async ngOnInit() {
    if (!this.user || !this.event) {
      throw new Error('Component needs event and user')
    }

    // Set this to loading
    this.isLoading = true;

    // To use this component we need the full hydrated object and we might not have it
    this.activity.clearStreams();
    this.activity.addStreams(await this.eventService.getAllStreams(this.user, this.event.getID(), this.activity.getID()).pipe(take(1)).toPromise());

    // Now build the controls
    this.activityFormGroup = new FormGroup({
        activity: new FormControl(this.activity),
        creatorName: new FormControl(this.activity.creator.name, [
          Validators.required,
        ]),
      }
    );

    // Find the starting distance for this activity
    if (this.activity.hasStreamData(DataDistance.type)) {
      this.activityFormGroup.addControl('startDistance', new FormControl(0, [
        Validators.required,
        Validators.min(0),
        Validators.max(this.activity.getSquashedStreamData(DataDistance.type)[this.activity.getSquashedStreamData(DataDistance.type).length - 1]),
      ]));
      this.activityFormGroup.addControl('endDistance', new FormControl(this.activity.getSquashedStreamData(DataDistance.type)[this.activity.getSquashedStreamData(DataDistance.type).length - 1], [
        Validators.required,
        Validators.min(0),
        Validators.max(this.activity.getSquashedStreamData(DataDistance.type)[this.activity.getSquashedStreamData(DataDistance.type).length - 1]),
      ]));

      this.activityFormGroup.validator = activityDistanceValidator;
    }
    // Set this to done loading
    this.isLoading = false;
  }


  hasError(field?: string) {
    if (!field) {
      return !this.activityFormGroup.valid;
    }
    return !(this.activityFormGroup.get(field).valid && this.activityFormGroup.get(field).touched);
  }

  async onSubmit(event) {
    event.preventDefault();
    if (!this.activityFormGroup.valid) {
      this.validateAllFormFields(this.activityFormGroup);
      return;
    }
    this.isLoading = true;
    if (this.activity.startDate < this.event.startDate) {
      this.event.startDate = this.activity.startDate;
    }
    if (this.activity.endDate > this.event.endDate) {
      this.event.endDate = this.activity.endDate;
    }


    try {
      if (this.activityFormGroup.get('creatorName').dirty) {
        await this.eventService.changeActivityCreatorName(this.user, this.event, this.activity, this.activityFormGroup.get('creatorName').value);
      }
      if (this.activity.hasStreamData(DataDistance.type) && (this.activityFormGroup.get('startDistance').dirty || this.activityFormGroup.get('endDistance').dirty)) {
        EventUtilities.cropDistance(Number(this.activityFormGroup.get('startDistance').value), Number(this.activityFormGroup.get('endDistance').value), this.activity);
        this.activity.clearStats();
        EventUtilities.generateMissingStreamsAndStatsForActivity(this.activity);
        EventUtilities.reGenerateStatsForEvent(this.event);
        await this.eventService.setEvent(this.user, this.event);
      }
      this.snackBar.open('Activity saved', null, {
        duration: 2000,
      });
    } catch (e) {
      // debugger;
      Sentry.captureException(e);
      this.logger.error(e);
      this.snackBar.open('Could not save activity', null, {
        duration: 2000,
      });
      Sentry.captureException(e);
    } finally {
      this.isLoading = false;
      this.dialogRef.close();
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({onlySelf: true});
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  close(event) {
    event.stopPropagation();
    event.preventDefault();
    this.dialogRef.close();
  }
}

