import { Component, OnInit } from '@angular/core';
import { User } from './../User';
import { SessionsService } from '../sessions.service';
import * as $ from 'jquery';
import { LocalStorageService, SessionStorageService, LocalStorage, SessionStorage } from 'angular-web-storage';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit {
  //Property for the user
  private user:User;
  private logged_in:boolean;
  private logged_in_username:string;
  private logged_in_user_id: any;
  

  @LocalStorage() localValue: Object = { text: `Hello ${+new Date}`};
  @LocalStorage('newKey', 10, 'h') localValue2: Object = { text: `Hello ${+new Date}`};
  @SessionStorage() sessionValue: string = `Hello ${+new Date}`;

  constructor(
    private sessionsService: SessionsService,
    public local: LocalStorageService,
    public session: SessionStorageService
  ) { }

  ngOnInit() {
    //Create a new user object
    this.user = new User({
      email:"", password: "", confirm_password: "", name: ""
    });

    this.logged_in = this.get('logged_in');
    this.logged_in_username = this.get('logged_in_username');
    this.logged_in_user_id = this.get('logged_in_user_id');
  }

  login(): void {
    this.sessionsService.login(this.user)
      .subscribe(data => this.displayLoggedInUser(this.user, data));
  }

  logout(): void {
    this.sessionsService.logout({user_id: this.logged_in_user_id})
      .subscribe(data => this.displayLoggedOutUser())
  }

  register(): void {
    this.sessionsService.register(this.user)
      .subscribe(data => this.login());
  }

  /**
   * Make the required changes when a user is logged in
   * 
   * @param user 
   * @param data 
   */
  displayLoggedInUser(user, data)
  {
    this.set(0, 'logged_in', true);
    this.set(0, 'logged_in_username', user['username']);
    this.set(0, 'logged_in_user_id', data['user_id']);

    $('#sign_in_panel').addClass('display-none');
    $('#register_panel').addClass('display-none');
    $('#logged_in_panel').removeClass('display-none').text(user['username']);
    $('#logout_panel').removeClass('display-none');
  }

  /**
   * Make the required changes when user is logged out
   */
  displayLoggedOutUser()
  {
    console.log('hi there');
    this.remove('logged_in');
    this.remove('logged_in_username');
    this.remove('logged_in_user_id');

    $('#sign_in_panel').removeClass('display-none');
    $('#register_panel').removeClass('display-none');
    $('#logged_in_panel').addClass('display-none');
    $('#logout_panel').addClass('display-none');
  }

  /**
   * Set an item in local storage
   * 
   * @param expired 
   * @param key 
   * @param value 
   */
  set(expired: number = 0, key, value)
  {
    this.local.set(key, value, expired, 's');
  }

  /**
   * Remove an item from local storage
   * 
   * @param key 
   */
  remove(key) 
  {
    this.local.remove(key);
  }

  /**
   * Get an item from local storage
   * 
   * @param key 
   */
  get(key) 
  {
    return this.local.get(key);
  }

  /**
   *  Clear loacal storage
   */
  clear() 
  {
    this.local.clear();
  }
}
