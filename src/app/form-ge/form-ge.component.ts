import { Component, OnInit, Input } from '@angular/core';
import { SignupService } from '../services/signup.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import * as moment from 'moment';
import { Message } from 'primeng/components/common/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { TranslateService } from '../../../node_modules/@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import * as $ from 'jquery';

import { FormOfflineComponent } from '../form-offline/form-offline.component';

@Component({
  selector: 'app-form-ge',
  templateUrl: './form-ge.component.html',
  styleUrls: ['./form-ge.component.scss']
})
export class FormGeComponent implements OnInit {

  @Input() formedUser: any;

  user = {
    fullname: '',
    cellphone: '',
    email: '',
    birthdate: '',
    password: '',
    repassword: '',
    local_committee: { id: '', name: ''},
    university: { id: '', name: ''},
    college_course: { id: '', name: ''},
    cellphone_contactable: '',
    english_level: { id: '', name: ''},
    spanish_level: { id: '', name: ''},
    scholarity: { id: '', name: ''},
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
    utm_content: ''
  }

  scholarityOptions: any = [
    {id: '0', name: 'Ensino Médio Completo' },
    {id: '2', name: 'Estudante de Graduação' },
    {id: '3', name: 'Mestrado ou Pós' },
    {id: '4', name: 'Graduado em até 1,5 anos' },
    {id: '5', name: 'Graduado há mais de 2 anos' },
    {id: '6', name: 'Outro' }
  ];

  englishLevelOptions: any = [
    { id: '0', name: 'Não tenho' },
    { id: '1', name: 'Básico' },
    { id: '2', name: 'Intermediário' },
    { id: '3', name: 'Avançado' },
    { id: '4', name: 'Fluente' }
  ];

  spanishLevelOptions: any = [
    { id: '0', name: 'Não tenho' },
    { id: '1', name: 'Básico' },
    { id: '2', name: 'Intermediário' },
    { id: '3', name: 'Avançado' },
    { id: '4', name: 'Fluente' }
  ];

  filteredScholarityOptions: Observable<any[]>;
  filteredUniversities: Observable<any[]>;
  filteredCourses: Observable<any[]>;
  filteredEnglishLevelOptions: Observable<any[]>;
  filteredSpanishLevelOptions: Observable<any[]>;
  filteredPlaces: Observable<any[]>;

  placeholderBirthdate: string;

  selectedItems: any = {
    language: false,
    marketing: false,
    information_technology: false,
    management: false
  };
  msgs: Message[] = [];

  personalData: boolean = true;
  studyData: boolean = false;

  invalidEmail: boolean = false;
  invalidPassword: boolean = false;
  invalidDate: boolean = false;
  invalidPhone: boolean = false;
  matchDate: boolean = true;
  loading: boolean = false;
  step1Form: FormGroup;
  step2Form: FormGroup;
  submittedPersonal: boolean = false;
  submittedStudy: boolean = false;
  completedSignup: boolean = false;

  universities: any;
  courses: any;
  places: any;

  constructor(
    public signupService: SignupService,
    public translate: TranslateService,
    public router: Router,
    public urlScrapper: ActivatedRoute,
    public formOfflineComponent: FormOfflineComponent
  ) {
    this.step1Form = new FormGroup({
      fullname: new FormControl(this.user.fullname, [
        Validators.required
      ]),
      cellphone: new FormControl(this.user.cellphone, [
        Validators.required
      ]),
      email: new FormControl(this.user.email, [
        Validators.required
      ]),
      birthdate: new FormControl(this.user.birthdate, [
        Validators.required
      ]),
      password: new FormControl(this.user.password, [
        Validators.required,
        Validators.pattern('^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z]).{8,}$')
      ]),
      repassword: new FormControl(this.user.repassword, [
        Validators.required,
        Validators.pattern('^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z]).{8,}$')
      ]),
      cellphone_contactable: new FormControl(this.user.cellphone_contactable, []),
    });
    this.step2Form = new FormGroup({
      university_id: new FormControl(this.user.university, [
        Validators.required
      ]),
      college_course_id: new FormControl(this.user.college_course, [
        Validators.required
      ]),
      local_committee_id: new FormControl(this.user.local_committee, [
        Validators.required
      ]),
      english_level: new FormControl(this.user.english_level, [
        Validators.required
      ]),
      spanish_level: new FormControl(this.user.spanish_level, [
        Validators.required
      ]),
      scholarity: new FormControl(this.user.scholarity, [
        Validators.required
      ]),
    });
    window.innerWidth > 600 ? this.placeholderBirthdate = "Os programas da AIESEC são para pessoas de 18 à 30 anos" : this.placeholderBirthdate = "Data de Nascimento";
  }

  ngOnInit() {

    if(this.formedUser){
      this.user = this.formedUser;
      this.personalData = false;
      this.studyData = true;
    }

    this.urlScrapper.queryParams.subscribe((param: any) => {
      if (param['utm_source']) {
        localStorage.setItem('utm_source', param['utm_source'])
      }

      if (param['utm_medium']) {
        localStorage.setItem('utm_medium', param['utm_medium'])
      }

      if (param['utm_campaign']) {
        localStorage.setItem('utm_campaign', param['utm_campaign'])
      }

      if (param['utm_term']) {
        localStorage.setItem('utm_term', param['utm_term'])
      }

      if (param['utm_content']) {
        localStorage.setItem('utm_content', param['utm_content'])
      }
    });

    this.filteredScholarityOptions = this.scholarityOptions;

    this.fillUniversitySelect().then(() => {
      this.filteredUniversities = this.universities;
    });

    this.fillCourseSelect().then(() => {
      this.filteredCourses = this.courses;
    });

    this.fillPlacesSelect().then(() => {
      this.filteredPlaces = this.places;
    });

    this.filteredEnglishLevelOptions = this.englishLevelOptions;

    this.filteredSpanishLevelOptions = this.spanishLevelOptions;
  }

  onResize(event){
    (event.target.innerWidth > 600 ? this.placeholderBirthdate = "Os programas da AIESEC são para pessoas de 18 à 30 anos" : this.placeholderBirthdate = "Data de nascimento");
  }

  cancelSignUp() {
    if(this.formedUser){
      this.formOfflineComponent.hideGEStep();
    }else{
      if(this.submittedPersonal){
        this.submittedPersonal = false;
        this.submittedStudy = false;
        this.personalData = true;
        this.studyData = false;
      }else{
        this.router.navigate(['/']);
      }
    }
  }

  accessAiesec() {
    window.open("https://aiesec.org/", "_blank");
  }

  isValidPersonal(field) {
    return !this.step1Form.controls[field].valid && (this.step1Form.controls[field].dirty || this.submittedPersonal)
  }

  isValidStudy(field) {
    return !this.step2Form.controls[field].valid && (this.step2Form.controls[field].dirty || this.submittedStudy)
  }

  fillUniversitySelect() {
    return this.signupService.getUniversities().then((res: any) => {
      let orderedList = _.orderBy(res, ['name'],['asc']);
      let other = _.remove(orderedList, item => item.name === 'OUTRA');
      this.universities = _.union(orderedList, other);
    }, (err) => {
      this.msgs = [];
      this.msgs.push({ severity: 'error', summary: 'FALHA EM RECUPERAR DADOS!', detail: 'Não foi possível recuperar os dados das faculdades disponíveis.' });
    })
  }

  fillCourseSelect() {
    return this.signupService.getCourses().then((res: any) => {
      let orderedList = _.orderBy(res, ['name'], ['asc']);
      let other = _.remove(orderedList, item => item.name === 'Outro');
      this.courses = _.union(orderedList, other);
    }, (err) => {
      this.msgs = [];
      this.msgs.push({ severity: 'error', summary: 'FALHA EM RECUPERAR DADOS!', detail: 'Não foi possível recuperar os dados dos cursos disponíveis.' });
    })
  }

  fillPlacesSelect() {
    return this.signupService.getLocalCommittees().then((res: any) => {
      let orderedList = _.orderBy(res, ['name'], ['asc']);
      this.places = orderedList;
    }, (err) => {
      this.msgs = [];
      this.msgs.push({ severity: 'error', summary: 'FALHA EM RECUPERAR DADOS!', detail: 'Não foi possível recuperar os dados das AIESEC disponíveis.' });
    })
  }

  changeScholarity(scholarity_level) {
    if (+scholarity_level <= 2 || +scholarity_level == 6) {
      this.user.university = {id: '', name: ''};
      this.user.college_course = {id: '', name: ''};
    }
  }

  unableToSubmit(){
    return this.emptyFields() || this.emptyUniversity() ||  this.emptyCourse();
  }

  emptyFields(){
    return !(this.user.scholarity && !!this.user.scholarity.id) || !(this.user.english_level && !!this.user.english_level.id) || !(this.user.spanish_level && !!this.user.spanish_level.id) || !(this.user.local_committee && !!this.user.local_committee.id);
  }

  emptyUniversity(){    
    if ((+this.user.scholarity.id >= 2 && +this.user.scholarity.id <= 5)) {
      if(this.user.university && this.user.university.id){
        return !this.user.university.id
      }else{
        return true;
      }
    }
    else {
      return false;
    }
  }

  emptyCourse(){
    if ((+this.user.scholarity.id >= 2 && +this.user.scholarity.id <= 5)) {
      if(this.user.college_course.id){
        return !this.user.college_course.id
      }else{
        return true;
      }
    }
    else {
      return false;
    }
  }

  checkDate() {
    let date = moment(this.user.birthdate, 'DDMMYYYY').format('DD/MM/YYYY').split('/');
    if ((+date[0] > 0 && +date[0] <= 31) && (+date[1] > 0 && +date[1] <= 12) && (+date[2] > 1900 && +date[2] < moment().year())) {
      this.invalidDate = false;
      let date = moment(this.user.birthdate, 'DD/MM/YYYY').format('YYYY-MM-DD');
      let age = moment().diff(date, 'years', false);
      (age >= 18 && age <= 30) ? this.matchDate = true : this.matchDate = false
    }
    else {
      this.invalidDate = true;
    }
  }

  checkPhone() {
    let cellphone = this.user.cellphone.replace(/[()_-]/g, '');

    if (cellphone.length < 10) {
      this.invalidPhone = true;
      return;
    }
    else {
      this.invalidPhone = false;
    }
  }

  registerUser() {
    this.submittedPersonal = true;
    if (this.user.password != this.user.repassword) {
      this.invalidPassword = true;
    }
    else {
      this.invalidPassword = false;
    }

    if (this.user.fullname && this.user.cellphone && this.user.email && this.user.birthdate && !this.invalidPassword && !this.invalidPhone && this.matchDate && !this.isValidPersonal('password')) {
      this.personalData = false;
      this.studyData = true;
    }
  }

  submit() {
    this.submittedStudy = true;

    let user = {
      ge_participant: {
        fullname: this.user.fullname,
        cellphone: this.user.cellphone.replace(/[()_-]/g, ''),
        email: this.user.email,
        password: this.user.password,
        birthdate: moment(this.user.birthdate, 'DDMMYYYY').format('DD/MM/YYYY'),
        local_committee_id: +this.user.local_committee.id,
        university_id: (this.user.university.id == '' ? null : +this.user.university.id),
        college_course_id: (this.user.college_course.id == '' ? null : +this.user.college_course.id),
        cellphone_contactable: (this.user.cellphone_contactable ? true : false),
        scholarity: +this.user.scholarity,
        english_level: +this.user.english_level.id,
        spanish_level: +this.user.spanish_level.id,
        utm_source: (localStorage.getItem('utm_source') ? localStorage.getItem('utm_source') : null),
        utm_medium: (localStorage.getItem('utm_medium') ? localStorage.getItem('utm_medium') : null),
        utm_campaign: (localStorage.getItem('utm_campaign') ? localStorage.getItem('utm_campaign') : null),
        utm_term: (localStorage.getItem('utm_term') ? localStorage.getItem('utm_term') : null),
        utm_content: (localStorage.getItem('utm_content') ? localStorage.getItem('utm_content') : null)
      }
    };

    this.loading = true;
    this.signupService.addGeParticipant(user)
      .then((res: any) => {
        this.loading = false;
        if (res.status == 'failure') {
          this.msgs = [];
          this.msgs.push({ severity: 'error', summary: 'FALHA AO SALVAR!', detail: 'Não foi possível salvar, tente novamente mais tarde.' });
        }
        else {
          this.completedSignup = true;
          localStorage.removeItem('utm_source');
          localStorage.removeItem('utm_medium');
          localStorage.removeItem('utm_campaign');
          localStorage.removeItem('utm_term');
          localStorage.removeItem('utm_content');
          this.router.navigate(['/empreendedor-global/obrigado']);
        }
      },
        (err) => {
          this.msgs = [];
          this.msgs.push({ severity: 'error', summary: 'ERRO AO SALVAR!', detail: 'Não foi possível salvar, tente novamente mais tarde.' });
          this.loading = false;
        }
      )
  }

  checkEmail() {
    this.signupService.checkValidEmail(this.user.email)
      .then((res: any) => {
        res.email_exists ? this.invalidEmail = true : this.invalidEmail = false;
      }, (err) => {
        this.msgs = [];
        this.msgs.push({ severity: 'error', summary: 'FALHA EM RECUPERAR DADOS!', detail: 'Não foi possível recuperar dados deste email.' });
      })
  }

  searchScholarity(event) {
    this.filteredScholarityOptions = _.filter(this.scholarityOptions, (option) => {
      return option.name.toLowerCase().indexOf(event.query.toLowerCase()) > -1;
    });
  };

  searchUnivesity(event) {
    this.filteredUniversities = _.filter(this.universities, (option) => {
      return option.name.toLowerCase().indexOf(event.query.toLowerCase()) > -1;
    });
  };

  searchCourses(event) {
    this.filteredCourses = _.filter(this.courses, (option) => {
      return option.name.toLowerCase().indexOf(event.query.toLowerCase()) > -1;
    });
  };

  searchPlaces(event) {
    this.filteredPlaces =  _.filter(this.places, (option) => {
      return option.name.toLowerCase().indexOf(event.query.toLowerCase()) > -1;
    });
  };

  searchEnglishLevels(event) {
    this.filteredEnglishLevelOptions =  _.filter(this.englishLevelOptions, (option) => {
      return option.name.toLowerCase().indexOf(event.query.toLowerCase()) > -1;
    });
  };

  searchSpanishLevels(event) {
    this.filteredSpanishLevelOptions =  _.filter(this.spanishLevelOptions, (option) => {
      return option.name.toLowerCase().indexOf(event.query.toLowerCase()) > -1;
    });
  };

  selectInput(element) {
    $('.form-group').css('z-index', '-1');
    $('.' + element).css('z-index', '10');
  }

  clearField(field) {
    console.log('eae', field, this.user[field]);
    this.user[field] = '';
  }
}
