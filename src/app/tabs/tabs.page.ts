/* Module imports */
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonTabs } from '@ionic/angular';

/* Service imports */
import { EventService } from '../services/event/event.service';


@Component({
  selector: 'tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  @ViewChild('tabs') tabs: IonTabs;

  constructor(
    public event: EventService,
    public router: Router
  ) { }

  /**
   * Handle tabbed navigation
   *
   * @param: tab - the destination tab
   * @param: event - the triggering event
   *
   * @return: none
   */
  async onTabClick(tab: string, event: MouseEvent): Promise<boolean> {
    const selectedTab: string = this.tabs.getSelected();
    event.stopImmediatePropagation();
    event.preventDefault();
    this.emitTabChange({tab: tab});
    return selectedTab === tab
      ? this.tabs.select(tab)
      : this.router.navigate([`tabs/${tab}`]);
  }

  /**
   * Emit tab change event
   *
   * @param: event - event that triggered tab change
   *
   * @return: none
   */
  emitTabChange(event: object): void {
    this.event.emit('tab-change', event);
  }

}
