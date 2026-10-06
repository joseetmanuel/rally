/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { KEYS_STORAGE } from '@constants/KeysStorage';
import { environment } from '@env/environment';
import { LocalStorageService } from '@services/storage/localstorage/localstorage.service';

@Injectable({ providedIn: 'root' })
export class AppConfigService {
	constructor(
		private local: LocalStorageService,
		private http: HttpClient
	) {}

	loadAppConfig() {

		return this.http.get(environment.conf).subscribe((res: any) => {
			this.local.removeByKey("url");
			this.local.removeByKey(KEYS_STORAGE.config);
			
			this.local.setObject(KEYS_STORAGE.config, res);
		});
	}
}
