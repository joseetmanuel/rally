import { Injectable } from "@angular/core";
import { Section } from "@models/section/Section";

@Injectable({
    providedIn: 'root'
})
export class MenuFilter{
    filterItems(data: Section[]){

        const items = data.filter((d) => d.inMenu == 1);

        items.forEach(x => {
            if (x.children) {
                x.children = x.children.filter((d) => d.inMenu == 1)
            }
        });

        return items;
    }
}