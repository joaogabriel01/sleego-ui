export namespace sleego {
	
	export class AppConfig {
	    name: string;
	    allowed_from: string;
	    allowed_to: string;
	
	    static createFrom(source: any = {}) {
	        return new AppConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.allowed_from = source["allowed_from"];
	        this.allowed_to = source["allowed_to"];
	    }
	}
	export class FileConfig {
	    apps: AppConfig[];
	    shutdown: string;
	    categories: Record<string, Array<string>>;
	
	    static createFrom(source: any = {}) {
	        return new FileConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.apps = this.convertValues(source["apps"], AppConfig);
	        this.shutdown = source["shutdown"];
	        this.categories = source["categories"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ProcessInfo {
	    Name: string;
	    Pid: number;
	    Category: string[];
	
	    static createFrom(source: any = {}) {
	        return new ProcessInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Pid = source["Pid"];
	        this.Category = source["Category"];
	    }
	}

}

