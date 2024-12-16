import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  input,
  OnChanges,
  output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category } from '../../interfaces/category.interface';

@Component({
  selector: 'app-dropdown-select',
  imports: [CommonModule, FormsModule],
  templateUrl: './dropdown-select.component.html',
  styleUrl: './dropdown-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownSelectComponent implements OnChanges {
  categories = input.required<Category[]>();
  changedState = output<Category[]>();

  rootItem: Category<Category> = {
    label: 'Выберите значение',
    children: [],
    isOpen: false,
    isChecked: false,
    isIndeterminate: false,
  };

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    if (
      this.rootItem.isOpen &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.rootItem.isOpen = false;

      this.fillRootLabel();
      this.onClosedDropdown();
    }
  }

  private onClosedDropdown(): void {
    if (this.rootItem.children) {
      const data = JSON.parse(
        JSON.stringify(this.rootItem.children)
      ) as Category[];
      data.forEach((category) => delete category.isOpen);
      this.changedState.emit(data);
    }
  }

  protected toggleDropdown(): void {
    this.rootItem.isOpen = !this.rootItem.isOpen;

    this.fillRootLabel();
    if (!this.rootItem.isOpen) {
      this.onClosedDropdown();
    }
  }

  protected toggleSubmenu(item: Category): void {
    item.isOpen = !item.isOpen;
  }

  protected onRootChanged(item: Category<Category>): void {
    this.rootItem.isOpen = true;

    if (item.children) {
      item.children.forEach((child) => {
        child.isChecked = item.isChecked;

        if (child.children) {
          child.children.forEach(
            (childChild) => (childChild.isChecked = child.isChecked)
          );
        }
      });
    }
    this.regulateAllNodes();
  }

  protected onCategoryChanged(item: Category): void {
    if (item.children) {
      item.children.forEach((child) => (child.isChecked = item.isChecked));
    }

    this.regulateAllNodes();
  }

  protected regulateAllNodes(): void {
    this.rootItem.children?.forEach((category) => {
      if (category.children) {
        if (category.children.every((stage) => stage.isChecked)) {
          category.isChecked = true;
          category.isIndeterminate = false;
        } else if (category.children.some((stage) => stage.isChecked)) {
          category.isChecked = false;
          category.isIndeterminate = true;
        } else {
          category.isChecked = false;
          category.isIndeterminate = false;
        }
      }
    });

    if (this.rootItem.children?.every((category) => category.isChecked)) {
      this.rootItem.isChecked = true;
      this.rootItem.isIndeterminate = false;
    } else if (
      this.rootItem.children?.some(
        (category) => category.isChecked || category.isIndeterminate
      )
    ) {
      this.rootItem.isChecked = false;
      this.rootItem.isIndeterminate = true;
    } else {
      this.rootItem.isChecked = false;
      this.rootItem.isIndeterminate = false;
    }

    this.fillRootLabel();
  }

  private fillRootLabel(): void {
    if (this.rootItem.isOpen) {
      if (this.rootItem.isChecked || this.rootItem.isIndeterminate) {
        this.rootItem.label = 'Снять выделение';
      } else {
        this.rootItem.label = 'Выбрать всё';
      }
    } else {
      let choosenCategory = 0;
      let choosenStages = 0;
      this.rootItem.children?.forEach((category) => {
        if (category.children) {
          category.children.forEach((stage) => {
            if (stage.isChecked) choosenStages++;
          });
        }
        if (category.isChecked || category.isIndeterminate) {
          choosenCategory++;
        }
      });

      const categoriesForms: [string, string, string] = [
        'воронка',
        'воронки',
        'воронок',
      ];
      const stagesForms: [string, string, string] = ['этап', 'этапа', 'этапов'];

      this.rootItem.label = `Выбрано: ${choosenCategory} ${this.getDeclension(
        choosenCategory,
        categoriesForms
      )}, ${choosenStages} ${this.getDeclension(choosenStages, stagesForms)}`;
    }
  }

  private getDeclension(
    count: number,
    forms: [string, string, string]
  ): string {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod100 >= 11 && mod100 <= 19) {
      return forms[2];
    }
    if (mod10 === 1) {
      return forms[0];
    }
    if (mod10 >= 2 && mod10 <= 4) {
      return forms[1];
    }
    return forms[2];
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.rootItem.children = this.categories();
    this.regulateAllNodes();
  }
}
