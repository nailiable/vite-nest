import { CategoryService } from './category.service'

@Controller('categories')
export default class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
}
