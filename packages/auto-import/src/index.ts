import { Options } from 'unplugin-auto-import/types'

export type ArrayItem<T> = T extends (infer U)[] ? U : T
export type Import = Exclude<Options['imports'], ArrayItem<Options['imports']>>

export function NestCoreAutoImportPreset(): Import {
  return [
    {
      from: '@nestjs/core',
      imports: [
        'Reflector',
      ],
    },
  ]
}

export function NestCommonAutoImportPreset(): Import {
  return [
    {
      from: '@nestjs/common',
      imports: [
        // Controller
        'Controller',
        'Get',
        'Post',
        'Put',
        'Patch',
        'Delete',
        'Options',
        'Head',
        'All',
        'Sse',
        // Request
        'Body',
        'Param',
        'Query',
        'Req',
        'Res',
        'Next',
        'Render',
        'Header',
        'Headers',
        'HostParam',
        'HttpCode',
        // Dependency Injection
        'Inject',
        'Injectable',
        'Scope',
        'Optional',
        // Guards
        'UseGuards',
        'UseInterceptors',
        // Pipes
        'UsePipes',
        // Filters
        'UseFilters',
        'Catch',
        // 'Module',
        'Module',
        'Global',
      ],
    },
    {
      from: '@nestjs/common',
      imports: [
        {
          name: 'Injectable',
          as: 'Guard',
        },
        {
          name: 'Injectable',
          as: 'Interceptor',
        },
        {
          name: 'Injectable',
          as: 'Pipe',
        },
        {
          name: 'Injectable',
          as: 'Filter',
        },
        {
          name: 'Injectable',
          as: 'Middleware',
        },
      ],
    },
  ]
}

export function NestSwaggerAutoImportPreset(): Import {
  return [
    {
      from: '@nestjs/swagger',
      imports: [
        'ApiAcceptedResponse',
        'ApiAmbiguousResponse',
        'ApiBadGatewayResponse',
        'ApiBadRequestResponse',
        'ApiBasicAuth',
        'ApiBearerAuth',
        'ApiBody',
        'ApiConflictResponse',
        'ApiConsumes',
        'ApiContinueResponse',
        'ApiCookieAuth',
        'ApiCreatedResponse',
        'ApiDefaultResponse',
        'ApiEarlyhintsResponse',
        'ApiExcludeController',
        'ApiExcludeEndpoint',
        'ApiExpectationFailedResponse',
        'ApiExtension',
        'ApiExtraModels',
        'ApiFailedDependencyResponse',
        'ApiForbiddenResponse',
        'ApiFoundResponse',
        'ApiGatewayTimeoutResponse',
        'ApiGoneResponse',
        'ApiHeader',
        'ApiHeaders',
        'ApiHideProperty',
        'ApiHttpVersionNotSupportedResponse',
        'ApiIAmATeapotResponse',
        'ApiInternalServerErrorResponse',
        'ApiLengthRequiredResponse',
        'ApiMethodNotAllowedResponse',
        'ApiMisdirectedResponse',
        'ApiMovedPermanentlyResponse',
        'ApiNoContentResponse',
        'ApiNonAuthoritativeInformationResponse',
        'ApiNotAcceptableResponse',
        'ApiNotFoundResponse',
        'ApiNotImplementedResponse',
        'ApiNotModifiedResponse',
        'ApiOAuth2',
        'ApiOkResponse',
        'ApiOperation',
        'ApiParam',
        'ApiPartialContentResponse',
        'ApiPayloadTooLargeResponse',
        'ApiPaymentRequiredResponse',
        'ApiPermanentRedirectResponse',
        'ApiPreconditionFailedResponse',
        'ApiPreconditionRequiredResponse',
        'ApiProcessingResponse',
        'ApiProduces',
        'ApiProperty',
        'ApiPropertyOptional',
        'ApiProxyAuthenticationRequiredResponse',
        'ApiQuery',
        'ApiRequestTimeoutResponse',
        'ApiRequestedRangeNotSatisfiableResponse',
        'ApiResetContentResponse',
        'ApiResponse',
        'ApiResponseProperty',
        'ApiSecurity',
        'ApiSeeOtherResponse',
        'ApiServiceUnavailableResponse',
        'ApiSwitchingProtocolsResponse',
        'ApiTags',
        'ApiTemporaryRedirectResponse',
        'ApiTooManyRequestsResponse',
        'ApiUnauthorizedResponse',
        'ApiUnprocessableEntityResponse',
        'ApiUnsupportedMediaTypeResponse',
        'ApiUriTooLongResponse',
      ],
    },
  ]
}
