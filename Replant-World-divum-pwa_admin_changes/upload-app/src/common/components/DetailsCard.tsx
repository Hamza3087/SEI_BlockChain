import React, { useState, useRef, useCallback } from 'react';
import { formatDate, formattedDate, formattedTime } from 'common/utils';
import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import arrowIcon from '@/assets/arrow.svg';
import { appTheme } from 'plugins/appTheme';
import { useFmtMsg } from 'modules/intl';
import { usePlantsInfinite } from 'modules/plants';
import { DetailsHeader } from './DetailsHeader';
import { useInfiniteScrolling, prettifyError } from 'common/utils';
import offline from '@/assets/offline.svg';
import { openSnackbar } from 'modules/snackbar';
import { allPlantsQueryKey } from '../../modules/plants/index';
import {
  offlineTreesQueryKey,
  useIsOnline,
  useOfflineStore,
  useOfflineTreesInfinite,
} from 'modules/offline';
import { Plant } from 'modules/plants';
import { useSpecies } from 'modules/species';
import { OfflineTree } from 'modules/offline/db';

export interface TreeItem {
  name: string;
  coordinates: string;
  date: string;
}
interface DetailsCardProps {
  onClose: () => void;
  title: string;
  count: number;
  onPreview: (plant: any) => void;
  status: string;
}

export const DetailsCard: React.FC<DetailsCardProps> = ({
  onPreview,
  title,
  count,
  onClose,
  status,
}) => {
  const [height, setHeight] = useState('75vh'); // Initialize with vh
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const currentHeight = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const store = useOfflineStore();
  const isOnline = useIsOnline();
  const fmtMsg = useFmtMsg();
  const queryClient = useQueryClient();
  const showUploadButton = store.totalCount > 0 && !store.isUploading;
  const { data: species } = useSpecies();

  const getPixelHeight = useCallback(() => {
    return (parseFloat(height) / 100) * window.innerHeight;
  }, [height]);

  // Drag handling logic
  const handleDragStart = useCallback(
    (y: number) => {
      setIsDragging(true);
      startY.current = y;
      currentHeight.current = getPixelHeight();
    },
    [getPixelHeight]
  );

  const handleDragMove = useCallback(
    (y: number) => {
      if (!isDragging) return;

      const delta = startY.current - y;
      const newHeight = currentHeight.current + delta;
      const minHeight = window.innerHeight * 0.45; //adjust this to adjust the drawer min height
      const maxHeight = window.innerHeight * 0.75; //adjust this to adjust the drawer max height

      const boundedHeight = Math.min(Math.max(newHeight, minHeight), maxHeight);
      const heightVH = (boundedHeight / window.innerHeight) * 100;
      setHeight(`${heightVH}vh`);
    },
    [isDragging]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    const currentVH = parseFloat(height);
    const snapPoints = [50, 70];
    const distances = snapPoints.map((p) => Math.abs(currentVH - p));
    const minDistance = Math.min(...distances);

    if (minDistance < 15) {
      // 15% threshold
      setHeight(`${snapPoints[distances.indexOf(minDistance)]}vh`);
    }
  }, [height]);

  // Touch event handlers for header
  const handleHeaderTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleDragStart(e.touches[0].clientY);
    },
    [handleDragStart]
  );

  const handleHeaderTouchMove = useCallback(
    (e: React.TouchEvent) => {
      handleDragMove(e.touches[0].clientY);
    },
    [handleDragMove]
  );

  const handleContainerTouchMove = useCallback(
    (_e: React.TouchEvent) => {
      if (!isDragging) return;
      // e.preventDefault();
    },
    [isDragging]
  );

  // Get online plants data
  const {
    data: onlineData,
    fetchNextPage: fetchNextOnlinePage,
    hasNextPage: hasNextOnlinePage,
    isFetchingNextPage: isFetchingNextOnlinePage,
  } = usePlantsInfinite(status);

  // Get offline trees data if status is FAILED
  const {
    data: offlineData,
    fetchNextPage: fetchNextOfflinePage,
    hasNextPage: hasNextOfflinePage,
    isFetchingNextPage: isFetchingNextOfflinePage,
  } = useOfflineTreesInfinite();

  // Combined infinite scrolling logic
  const { lastItemRef } = useInfiniteScrolling(() => {
    if (status === 'FAILED') {
      // Handle offline data pagination
      if (hasNextOfflinePage && !isFetchingNextOfflinePage) {
        fetchNextOfflinePage();
      }
    } else {
      // Handle online data pagination
      if (hasNextOnlinePage && !isFetchingNextOnlinePage) {
        fetchNextOnlinePage();
      }
    }
  });

  // Handle upload for offline trees
  const upload = async () => {
    try {
      await store.upload();
      openSnackbar(fmtMsg('uploadFinishedSuccessfully'), 'success', 5000);
      onClose();
      window.location.reload();
    } catch (e) {
      openSnackbar(
        fmtMsg('uploadAborted', {
          error: e instanceof AxiosError ? prettifyError(e) : String(e),
        }),
        'error'
      );
    } finally {
      queryClient.invalidateQueries({ queryKey: allPlantsQueryKey });
      queryClient.invalidateQueries({ queryKey: offlineTreesQueryKey });
    }
  };

  // Get data based on status
  const getDisplayItems = () => {
    if (status === 'FAILED') {
      // Return offline trees
      return offlineData?.pages.flatMap((page) => page.results) || [];
    } else {
      // Get online plants and filter based on status
      const plants = onlineData?.pages.flatMap((page) => page?.results) || [];
      return plants;
    }
  };

  const displayItems = getDisplayItems();

  // Helper function to get date text for online plants
  const getDateText = (reviewState: string, createdAt: string) => {
    switch (reviewState) {
      case 'PENDING':
        return `${fmtMsg('from')} ${formatDate(createdAt)}`;
      case 'APPROVED':
        return `${fmtMsg('approvedOn')} ${formatDate(createdAt)}`;
      case 'REJECTED':
        return `${fmtMsg('rejectedOn')} ${formatDate(createdAt)}`;
      default:
        return '';
    }
  };

  // Render either an online plant or offline tree
  const renderItem = (
    item: Plant | OfflineTree,
    index: number,
    array: any[]
  ) => {
    // Determine if this is an offline tree
    const isOfflineTree = 'tree' in item;

    if (isOfflineTree) {
      // Offline tree rendering
      const offlineItem = item as OfflineTree;

      const { botanical_name } =
        species?.find(
          (species) => species.id === offlineItem.tree.assigned_species_id
        )?.species || {};

      return (
        <div
          key={offlineItem.id}
          className='flex items-center p-2 pr-5'
          onClick={() => onPreview(offlineItem)}
          ref={index === array.length - 1 ? lastItemRef : undefined}
        >
          {/* Tree icon/image */}
          <div className='h-36 w-24 flex-shrink-0 mr-4 p-2 relative'>
            <img
              src={offlineItem.tree.image}
              alt='Plant'
              className='w-full h-full object-cover rounded-lg'
            />
          </div>

          {/* Tree information */}
          <div className='flex-1 space-y-1'>
            <h3
              className='text-base font-bold'
              style={{
                color: appTheme.primaryPalette.black,
              }}
            >
              {botanical_name}{' '}
            </h3>
            <p
              className='text-sm'
              style={{
                color: appTheme.secondaryPalette.slateGray,
              }}
            >
              {`${offlineItem.tree.latitude}, ${offlineItem.tree.longitude}`}
            </p>
            <p
              className='text-sm'
              style={{
                color: appTheme.primaryPalette.black,
              }}
            >
              {fmtMsg('from')} {formatDate(offlineItem.tree.captured_at)}
            </p>
          </div>
          <div>
            <button
              className='w-8 h-8 rounded-full flex items-center justify-center'
              style={{
                backgroundColor: appTheme.secondaryPalette.lightWhiteSmoke,
                // boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
              }}
              onClick={() => onPreview(offlineItem)}
            >
              <img src={arrowIcon} alt='Arrow' className='w-4 h-4' />
            </button>
          </div>
        </div>
      );
    } else {
      // Online plant rendering
      const onlineItem = item as Plant;
      return (
        <div
          key={onlineItem.id}
          className='flex items-center p-2 pr-5'
          onClick={() => onPreview(onlineItem)}
          ref={index === array.length - 1 ? lastItemRef : undefined}
        >
          {/* Tree icon/image */}
          <div className='h-36 w-24 flex-shrink-0 mr-4 p-2 relative'>
            <img
              src={onlineItem.image}
              alt='Plant'
              className='w-full h-full object-cover rounded-lg'
            />
          </div>

          {/* Tree information */}
          <div className='flex-1 space-y-1'>
            <h3
              className='text-base font-bold'
              style={{
                color: appTheme.primaryPalette.black,
              }}
            >
              {onlineItem.species.botanical_name}
            </h3>
            {status === 'PLANTED' && (
              <h3
                className='text-sm font-normal'
                style={{
                  color: appTheme.primaryPalette.black,
                }}
              >
                {onlineItem.species.common_name}
              </h3>
            )}
            {status === 'PLANTED' && (
              <div className='flex flex-row items-center gap-1'>
                <p
                  className='text-sm'
                  style={{
                    color: appTheme.secondaryPalette.slateGray,
                  }}
                >
                  {onlineItem?.species?.is_native ? 'Native' : 'Exotic'}
                </p>
                <span
                  className='text-sm'
                  style={{
                    color: appTheme.secondaryPalette.slateGray,
                    opacity: '30%',
                  }}
                >
                  |
                </span>
                <p
                  className='text-sm'
                  style={{
                    color: appTheme.secondaryPalette.slateGray,
                  }}
                >
                  #{onlineItem.id}
                </p>
              </div>
            )}
            <p
              className='text-sm'
              style={{
                color: appTheme.secondaryPalette.slateGray,
              }}
            >
              {`${onlineItem.latitude}, ${onlineItem.longitude}`}
            </p>
            {status !== 'PLANTED' && (
              <p
                className='text-sm'
                style={{
                  color: appTheme.primaryPalette.black,
                }}
              >
                {getDateText(onlineItem.review_state, onlineItem.created_at)}
              </p>
            )}
            {status === 'PLANTED' && (
              <div className='flex flex-row items-center gap-1'>
                <p
                  className='text-sm'
                  style={{
                    color: appTheme.secondaryPalette.slateGray,
                  }}
                >
                  {formattedDate(onlineItem.created_at)}
                </p>
                <span
                  className='text-sm'
                  style={{
                    color: appTheme.secondaryPalette.slateGray,
                    opacity: '30%',
                  }}
                >
                  |
                </span>
                <p
                  className='text-sm'
                  style={{
                    color: appTheme.secondaryPalette.slateGray,
                  }}
                >
                  {formattedTime(onlineItem.created_at)}
                </p>
              </div>
            )}
            {status !== 'PLANTED' && onlineItem.rejection_reason && (
              <p
                className='text-sm'
                style={{
                  color: appTheme.secondaryPalette.darkRed,
                }}
              >
                {onlineItem.rejection_reason}
              </p>
            )}
          </div>
          <div>
            <button
              className='w-8 h-8 rounded-full flex items-center justify-center'
              style={{
                backgroundColor: appTheme.secondaryPalette.lightWhiteSmoke,
                // boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
              }}
              onClick={() => onPreview(onlineItem)}
            >
              <img src={arrowIcon} alt='Arrow' className='w-4 h-4' />
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div
      ref={containerRef}
      className='w-full max-w-md rounded-t-3xl shadow-md z-50'
      style={{
        backgroundColor: appTheme.primaryPalette.white,
        height: height,
        transition: isDragging ? 'none' : 'height 0.3s ease',
      }}
      onTouchMove={handleContainerTouchMove}
    >
      <DetailsHeader
        title={title}
        count={count}
        onClose={onClose}
        draggable
        onTouchStart={handleHeaderTouchStart}
        onTouchMove={handleHeaderTouchMove}
        onTouchEnd={handleDragEnd}
      />
      <div
        className='py-2 overflow-y-auto'
        style={{
          height: 'calc(100% - 120px)',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {displayItems.map((item, index, array) =>
          renderItem(item, index, array)
        )}
      </div>
      <div className='sticky bottom-0 bg-white'>
        {showUploadButton && status === 'FAILED' && (
          <div className='p-4'>
            <button
              type='submit'
              className='w-full text-base font-semibold py-3 mt-1 rounded-3xl focus:outline-none'
              style={{
                color: appTheme.primaryPalette.white,
                backgroundColor: appTheme.secondaryPalette.darkForestGreen,
                opacity: isOnline ? 1 : 0.6,
              }}
              onClick={upload}
              aria-label='Re-Upload'
              disabled={!isOnline}
            >
              {fmtMsg('reUpload')}
            </button>
          </div>
        )}
        {!isOnline && status === 'FAILED' && (
          <div className='flex flex-row items-center justify-center gap-2 pb-4'>
            <p
              className='text-md font-medium'
              style={{
                color: appTheme.secondaryPalette.salmonRed,
              }}
            >
              {fmtMsg('noInternetConnection')}{' '}
            </p>
            <img src={offline} alt='Offline' className='h-4 w-4' />
          </div>
        )}
      </div>
    </div>
  );
};
