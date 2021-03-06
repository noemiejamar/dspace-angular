import { cold, getTestScheduler, hot } from 'jasmine-marbles';
import { of as observableOf } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { getMockRemoteDataBuildService } from '../../shared/mocks/remote-data-build.service.mock';
import { getMockRequestService } from '../../shared/mocks/request.service.mock';
import { HALEndpointServiceStub } from '../../shared/testing/hal-endpoint-service.stub';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { RequestEntry } from '../data/request.reducer';
import { RequestService } from '../data/request.service';
import { BrowseDefinition } from '../shared/browse-definition.model';
import { BrowseEntrySearchOptions } from './browse-entry-search-options.model';
import { BrowseService } from './browse.service';
import { createSuccessfulRemoteDataObject, createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';
import { createPaginatedList } from '../../shared/testing/utils.test';
import { GetRequest } from '../data/request.models';

describe('BrowseService', () => {
  let scheduler: TestScheduler;
  let service: BrowseService;
  let requestService: RequestService;
  let rdbService: RemoteDataBuildService;

  const browsesEndpointURL = 'https://rest.api/browses';
  const halService: any = new HALEndpointServiceStub(browsesEndpointURL);
  const browseDefinitions = [
    Object.assign(new BrowseDefinition(), {
      id: 'date',
      metadataBrowse: false,
      sortOptions: [
        {
          name: 'title',
          metadata: 'dc.title'
        },
        {
          name: 'dateissued',
          metadata: 'dc.date.issued'
        },
        {
          name: 'dateaccessioned',
          metadata: 'dc.date.accessioned'
        }
      ],
      defaultSortOrder: 'ASC',
      type: 'browse',
      metadataKeys: [
        'dc.date.issued'
      ],
      _links: {
        self: { href: 'https://rest.api/discover/browses/dateissued' },
        items: { href: 'https://rest.api/discover/browses/dateissued/items' }
      }
    }),
    Object.assign(new BrowseDefinition(), {
      id: 'author',
      metadataBrowse: true,
      sortOptions: [
        {
          name: 'title',
          metadata: 'dc.title'
        },
        {
          name: 'dateissued',
          metadata: 'dc.date.issued'
        },
        {
          name: 'dateaccessioned',
          metadata: 'dc.date.accessioned'
        }
      ],
      defaultSortOrder: 'ASC',
      type: 'browse',
      metadataKeys: [
        'dc.contributor.*',
        'dc.creator'
      ],
      _links: {
        self: { href: 'https://rest.api/discover/browses/author' },
        entries: { href: 'https://rest.api/discover/browses/author/entries' },
        items: { href: 'https://rest.api/discover/browses/author/items' }
      }
    })
  ];

  let browseDefinitionDataService;

  const getRequestEntry$ = (successful: boolean) => {
    return observableOf({
      response: { isSuccessful: successful, payload: browseDefinitions } as any
    } as RequestEntry);
  };

  function initTestService() {
    browseDefinitionDataService = jasmine.createSpyObj('browseDefinitionDataService', {
      findAll: createSuccessfulRemoteDataObject$(createPaginatedList(browseDefinitions))
    });
    return new BrowseService(
      requestService,
      halService,
      browseDefinitionDataService,
      rdbService
    );
  }

  beforeEach(() => {
    scheduler = getTestScheduler();
  });

  describe('getBrowseDefinitions', () => {

    beforeEach(() => {
      requestService = getMockRequestService(getRequestEntry$(true));
      rdbService = getMockRemoteDataBuildService();
      service = initTestService();
      spyOn(halService, 'getEndpoint').and
        .returnValue(hot('--a-', { a: browsesEndpointURL }));
      spyOn(rdbService, 'buildList').and.callThrough();
    });

    it('should call BrowseDefinitionDataService to create the RemoteData Observable', () => {
      service.getBrowseDefinitions();
      expect(browseDefinitionDataService.findAll).toHaveBeenCalled();

    });
  });

  describe('getBrowseEntriesFor and getBrowseItemsFor', () => {
    const mockAuthorName = 'Donald Smith';

    beforeEach(() => {
      requestService = getMockRequestService(getRequestEntry$(true));
      rdbService = getMockRemoteDataBuildService();
      service = initTestService();
      spyOn(service, 'getBrowseDefinitions').and
        .returnValue(hot('--a-', {
          a: createSuccessfulRemoteDataObject(createPaginatedList(browseDefinitions))
        }));
      spyOn(rdbService, 'buildList').and.callThrough();
    });

    describe('when getBrowseEntriesFor is called with a valid browse definition id', () => {
      it('should configure a new BrowseEntriesRequest', () => {
        const expected = new GetRequest(requestService.generateRequestId(), browseDefinitions[1]._links.entries.href);

        scheduler.schedule(() => service.getBrowseEntriesFor(new BrowseEntrySearchOptions(browseDefinitions[1].id)).subscribe());
        scheduler.flush();

        expect(requestService.configure).toHaveBeenCalledWith(expected);
      });

      it('should call RemoteDataBuildService to create the RemoteData Observable', () => {
        service.getBrowseEntriesFor(new BrowseEntrySearchOptions(browseDefinitions[1].id));

        expect(rdbService.buildList).toHaveBeenCalled();

      });

    });

    describe('when getBrowseItemsFor is called with a valid browse definition id', () => {
      it('should configure a new BrowseItemsRequest', () => {
        const expected = new GetRequest(requestService.generateRequestId(), browseDefinitions[1]._links.items.href + '?filterValue=' + mockAuthorName);

        scheduler.schedule(() => service.getBrowseItemsFor(mockAuthorName, new BrowseEntrySearchOptions(browseDefinitions[1].id)).subscribe());
        scheduler.flush();

        expect(requestService.configure).toHaveBeenCalledWith(expected);
      });

      it('should call RemoteDataBuildService to create the RemoteData Observable', () => {
        service.getBrowseItemsFor(mockAuthorName, new BrowseEntrySearchOptions(browseDefinitions[1].id));

        expect(rdbService.buildList).toHaveBeenCalled();

      });

    });
  });

  describe('getBrowseURLFor', () => {

    describe('if getBrowseDefinitions fires', () => {
      beforeEach(() => {
        requestService = getMockRequestService(getRequestEntry$(true));
        rdbService = getMockRemoteDataBuildService();
        service = initTestService();
        spyOn(service, 'getBrowseDefinitions').and
          .returnValue(hot('--a-', {
            a: createSuccessfulRemoteDataObject(createPaginatedList(browseDefinitions))
          }));
      });

      it('should return the URL for the given metadataKey and linkPath', () => {
        const metadataKey = 'dc.date.issued';
        const linkPath = 'items';
        const expectedURL = browseDefinitions[0]._links[linkPath];

        const result = service.getBrowseURLFor(metadataKey, linkPath);
        const expected = cold('c-d-', { c: undefined, d: expectedURL });

        expect(result).toBeObservable(expected);
      });

      it('should work when the definition uses a wildcard in the metadataKey', () => {
        const metadataKey = 'dc.contributor.author';  // should match dc.contributor.* in the definition
        const linkPath = 'items';
        const expectedURL = browseDefinitions[1]._links[linkPath];

        const result = service.getBrowseURLFor(metadataKey, linkPath);
        const expected = cold('c-d-', { c: undefined, d: expectedURL });

        expect(result).toBeObservable(expected);
      });

      it('should throw an error when the key doesn\'t match', () => {
        const metadataKey = 'dc.title'; // isn't in the definitions
        const linkPath = 'items';

        const result = service.getBrowseURLFor(metadataKey, linkPath);
        const expected = cold('c-#-', { c: undefined }, new Error(`A browse endpoint for ${linkPath} on ${metadataKey} isn't configured`));

        expect(result).toBeObservable(expected);
      });

      it('should throw an error when the link doesn\'t match', () => {
        const metadataKey = 'dc.date.issued';
        const linkPath = 'collections'; // isn't in the definitions

        const result = service.getBrowseURLFor(metadataKey, linkPath);
        const expected = cold('c-#-', { c: undefined }, new Error(`A browse endpoint for ${linkPath} on ${metadataKey} isn't configured`));

        expect(result).toBeObservable(expected);
      });

    });

    describe('if getBrowseDefinitions doesn\'t fire', () => {
      it('should return undefined', () => {
        requestService = getMockRequestService(getRequestEntry$(true));
        rdbService = getMockRemoteDataBuildService();
        service = initTestService();
        spyOn(service, 'getBrowseDefinitions').and
          .returnValue(hot('----'));

        const metadataKey = 'dc.date.issued';
        const linkPath = 'items';

        const result = service.getBrowseURLFor(metadataKey, linkPath);
        const expected = cold('b---', { b: undefined });
        expect(result).toBeObservable(expected);
      });
    });
  });

  describe('getFirstItemFor', () => {
    beforeEach(() => {
      requestService = getMockRequestService();
      rdbService = getMockRemoteDataBuildService();
      service = initTestService();
      spyOn(service, 'getBrowseDefinitions').and
        .returnValue(hot('--a-', {
          a: createSuccessfulRemoteDataObject(createPaginatedList(browseDefinitions))
        }));
      spyOn(rdbService, 'buildList').and.callThrough();
    });

    describe('when getFirstItemFor is called with a valid browse definition id', () => {
      const expectedURL = browseDefinitions[1]._links.items.href + '?page=0&size=1';

      it('should configure a new BrowseItemsRequest', () => {
        const expected = new GetRequest(requestService.generateRequestId(), expectedURL);

        scheduler.schedule(() => service.getFirstItemFor(browseDefinitions[1].id).subscribe());
        scheduler.flush();

        expect(requestService.configure).toHaveBeenCalledWith(expected);
      });

      it('should call RemoteDataBuildService to create the RemoteData Observable', () => {
        service.getFirstItemFor(browseDefinitions[1].id);

        expect(rdbService.buildList).toHaveBeenCalled();
      });

    });
  });

});
