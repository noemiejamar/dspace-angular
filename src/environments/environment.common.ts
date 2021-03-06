import { GlobalConfig } from '../config/global-config.interface';
import { NotificationAnimationsType } from '../app/shared/notifications/models/notification-animations-type';
import { BrowseByType } from '../app/+browse-by/+browse-by-switcher/browse-by-decorator';
import { RestRequestMethod } from '../app/core/data/rest-request-method';

export const environment: GlobalConfig = {
  production: true,
  // Angular Universal server settings.
  // NOTE: these must be "synced" with the 'dspace.ui.url' setting in your backend's local.cfg.
  ui: {
    ssl: false,
    host: 'localhost',
    port: 4000,
    // NOTE: Space is capitalized because 'namespace' is a reserved string in TypeScript
    nameSpace: '/',
    // The rateLimiter settings limit each IP to a "max" of 500 requests per "windowMs" (1 minute).
    rateLimiter: {
      windowMs: 1 * 60 * 1000,   // 1 minute
      max: 500 // limit each IP to 500 requests per windowMs
    }
  },
  // The REST API server settings.
  // NOTE: these must be "synced" with the 'dspace.server.url' setting in your backend's local.cfg.
  rest: {
    ssl: false,
    host: 'localhost',
    port: 8080,
    // NOTE: Space is capitalized because 'namespace' is a reserved string in TypeScript
    nameSpace: '/server',
  },
  // Caching settings
  cache: {
    // NOTE: how long should objects be cached for by default
    msToLive: {
      default: 15 * 60 * 1000, // 15 minutes
    },
    // msToLive: 1000, // 15 minutes
    control: 'max-age=60', // revalidate browser
    autoSync: {
      defaultTime: 0,
      maxBufferSize: 100,
      timePerMethod: {[RestRequestMethod.PATCH]: 3} as any // time in seconds
    }
  },
  // Form settings
  form: {
    // NOTE: Map server-side validators to comparative Angular form validators
    validatorMap: {
      required: 'required',
      regex: 'pattern'
    }
  },
  // Notifications
  notifications: {
    rtl: false,
    position: ['top', 'right'],
    maxStack: 8,
    // NOTE: after how many seconds notification is closed automatically. If set to zero notifications are not closed automatically
    timeOut: 5000, // 5 second
    clickToClose: true,
    // NOTE: 'fade' | 'fromTop' | 'fromRight' | 'fromBottom' | 'fromLeft' | 'rotate' | 'scale'
    animate: NotificationAnimationsType.Scale
  },
  // Submission settings
  submission: {
    autosave: {
      // NOTE: which metadata trigger an autosave
      metadata: [],
      /**
       * NOTE: after how many time (milliseconds) submission is saved automatically
       * eg. timer: 5 * (1000 * 60); // 5 minutes
       */
      timer: 0
    },
    icons: {
      metadata: [
        /**
         * NOTE: example of configuration
         * {
         *    // NOTE: metadata name
         *    name: 'dc.author',
         *    // NOTE: fontawesome (v5.x) icon classes and bootstrap utility classes can be used
         *    style: 'fa-user'
         * }
         */
        {
          name: 'dc.author',
          style: 'fas fa-user'
        },
        // default configuration
        {
          name: 'default',
          style: ''
        }
      ],
      authority: {
        confidence: [
          /**
           * NOTE: example of configuration
           * {
           *    // NOTE: confidence value
           *    value: 'dc.author',
           *    // NOTE: fontawesome (v4.x) icon classes and bootstrap utility classes can be used
           *    style: 'fa-user'
           * }
           */
          {
            value: 600,
            style: 'text-success'
          },
          {
            value: 500,
            style: 'text-info'
          },
          {
            value: 400,
            style: 'text-warning'
          },
          // default configuration
          {
            value: 'default',
            style: 'text-muted'
          },

        ]
      }
    }
  },
  // Angular Universal settings
  universal: {
    preboot: true,
    async: true,
    time: false
  },
  // Google Analytics tracking id
  gaTrackingId: '',
  // Log directory
  logDirectory: '.',
  // NOTE: will log all redux actions and transfers in console
  debug: false,
  // Default Language in which the UI will be rendered if the user's browser language is not an active language
  defaultLanguage: 'en',
  // Languages. DSpace Angular holds a message catalog for each of the following languages.
  // When set to active, users will be able to switch to the use of this language in the user interface.
  languages: [{
    code: 'en',
    label: 'English',
    active: true,
  }, {
    code: 'de',
    label: 'Deutsch',
    active: true,
  }, {
    code: 'cs',
    label: 'Čeština',
    active: true,
  }, {
    code: 'nl',
    label: 'Nederlands',
    active: true,
  }, {
    code: 'pt',
    label: 'Português',
    active: true,
  }, {
    code: 'fr',
    label: 'Français',
    active: true,
  }, {
    code: 'lv',
    label: 'Latviešu',
    active: true,
  },{
    code: 'fi',
    label: 'Suomi',
    active: true,
  }],
  // Browse-By Pages
  browseBy: {
    // Amount of years to display using jumps of one year (current year - oneYearLimit)
    oneYearLimit: 10,
    // Limit for years to display using jumps of five years (current year - fiveYearLimit)
    fiveYearLimit: 30,
    // The absolute lowest year to display in the dropdown (only used when no lowest date can be found for all items)
    defaultLowerLimit: 1900,
    // List of all the active Browse-By types
    // Adding a type will activate their Browse-By page and add them to the global navigation menu,
    // as well as community and collection pages
    // Allowed fields and their purpose:
    //    id:             The browse id to use for fetching info from the rest api
    //    type:           The type of Browse-By page to display
    //    metadataField:  The metadata-field used to create starts-with options (only necessary when the type is set to 'date')
    types: [
      {
        id: 'title',
        type: BrowseByType.Title,
      },
      {
        id: 'dateissued',
        type: BrowseByType.Date,
        metadataField: 'dc.date.issued'
      },
      {
        id: 'author',
        type: BrowseByType.Metadata
      },
      {
        id: 'subject',
        type: BrowseByType.Metadata
      }
    ]
  },
  item: {
    edit: {
      undoTimeout: 10000 // 10 seconds
    }
  },
  collection: {
    edit: {
      undoTimeout: 10000 // 10 seconds
    }
  },
  theme: {
    name: 'default',
  },
  // Whether the UI should rewrite file download URLs to match its domain. Only necessary to enable when running UI and REST API on separate domains
  rewriteDownloadUrls: false,
};
