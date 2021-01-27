import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonTabs } from '@ionic/angular';

import { EventService } from '../services/event/event.service';


@Component({
  selector: 'tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  @ViewChild('tabs') tabs: IonTabs;

  constructor(
    public router: Router,
    public event: EventService
  ) { }

  async onTabClick(tab: string, event: MouseEvent): Promise<boolean> {
    const selectedTab = this.tabs.getSelected();
    event.stopImmediatePropagation();
    event.preventDefault();
    this.emitTabChange({tab: tab});
    return selectedTab === tab
      ? this.tabs.select(tab)
      : this.router.navigate([`tabs/${tab}`]);
  }

  emitTabChange(event: object) {
    this.event.emit('tab-change', event);
  }

}
