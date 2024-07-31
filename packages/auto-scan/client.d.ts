type MacroClassDecorator = ClassDecorator

/**
 * Macro Decorator that marks a class as a [module](https://docs.nestjs.com/modules)
 * and auto inject all controllers and providers in the same directory.
 *
 * @param {boolean} canRootScan - If true, it will auto inject in RootScan module. Default is true.
 * @publicApi
 */
declare function AutoScan(canRootScan?: boolean): MacroClassDecorator
/**
 * Macro Decorator that marks a class as a [module](https://docs.nestjs.com/modules)
 * and auto inject all controllers、providers and modules in the same directory and subdirectories.
 *
 * @publicApi
 */
declare function RootScan(): MacroClassDecorator
