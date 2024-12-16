import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { DropdownSelectComponent } from './components/dropdown-select/dropdown-select.component';
import { Category } from './interfaces/category.interface';
import { CategoryStorageService } from './services/category-storage.service';

@Component({
  selector: 'app-root',
  imports: [DropdownSelectComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  categories = signal<Category[]>([]);

  constructor(private categoryStorage: CategoryStorageService) {}

  saveCategory(categories: Category[]): void {
    this.categoryStorage.saveCategories(categories);
  }

  ngOnInit(): void {
    this.categoryStorage
      .getCategories()
      .then((res) => this.categories.set(res));
  }
}
