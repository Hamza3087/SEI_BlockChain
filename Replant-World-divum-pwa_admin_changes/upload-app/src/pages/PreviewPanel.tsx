import { formatDate } from 'common/utils';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DetailsHeader } from '../common/components/DetailsHeader';
import { appTheme } from 'plugins/appTheme';
import { useFmtMsg } from 'modules/intl';
import { useSpecies } from 'modules/species';

interface PreviewPanelProps {
  plant: any;
  onClose: () => void;
  status: string;
}
export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  plant,
  onClose,
  status,
}) => {
  const [height, setHeight] = useState('75vh'); // Initial height
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const currentHeight = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const { data: species } = useSpecies();
  const fmtMsg = useFmtMsg();

  // Drag handling logic
  const handleDragStart = useCallback(
    (y: number) => {
      setIsDragging(true);
      isDraggingRef.current = true;
      startY.current = y;
      currentHeight.current = (parseFloat(height) / 100) * window.innerHeight;
    },
    [height]
  );

  const handleDragMove = useCallback((y: number) => {
    if (!isDraggingRef.current) return;

    const delta = startY.current - y;
    const newHeight = currentHeight.current + delta;
    const minHeight = window.innerHeight * 0.5;
    const maxHeight = window.innerHeight * 0.75;

    const boundedHeight = Math.min(Math.max(newHeight, minHeight), maxHeight);
    const heightVH = (boundedHeight / window.innerHeight) * 100;
    setHeight(`${heightVH}vh`);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    isDraggingRef.current = false;
    const currentVH = parseFloat(height);
    const snapPoints = [50, 70];
    const distances = snapPoints.map((p) => Math.abs(currentVH - p));
    const minDistance = Math.min(...distances);

    if (minDistance < 15) {
      setHeight(`${snapPoints[distances.indexOf(minDistance)]}vh`);
    }
  }, [height]);

  // Touch event handlers
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

  // Prevent body scroll during drag
  useEffect(() => {
    if (isDragging) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isDragging]);

  // Add touchmove listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
    };

    container.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });
    return () => container.removeEventListener('touchmove', handleTouchMove);
  }, []);

  const isOfflineTree = 'tree' in plant;
  const plantData = isOfflineTree ? plant.tree : plant;
  const title =
    status === 'REJECTED' || status === 'PENDING' || status === 'FAILED'
      ? fmtMsg('treeDetails')
      : plantData?.species?.botanical_name;

  const { botanical_name } =
    species?.find((species) => species.id === plantData.assigned_species_id)
      ?.species || {};

  const getDateText = (reviewState: string, createdAt: string) => {
    switch (reviewState) {
      case 'PLANTED':
        return `${fmtMsg('plantedOn')} ${formatDate(createdAt)}`;
      case 'PENDING':
      case 'FAILED':
        return `${fmtMsg('from')} ${formatDate(createdAt)}`;
      case 'APPROVED':
        return `${fmtMsg('approvedOn')} ${formatDate(createdAt)}`;
      case 'REJECTED':
        return `${fmtMsg('rejectedOn')} ${formatDate(createdAt)}`;
      default:
        return '';
    }
  };
  const getStatusText = (reviewState: string) => {
    switch (reviewState) {
      case 'PENDING':
      case 'FAILED':
        return fmtMsg('pending');
      case 'REJECTED':
        return plantData.rejection_reason;
      default:
        return '';
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
        touchAction: isDragging ? 'none' : 'auto',
      }}
    >
      <DetailsHeader
        title={title}
        onClose={onClose}
        draggable
        onTouchStart={handleHeaderTouchStart}
        onTouchMove={handleHeaderTouchMove}
        onTouchEnd={handleDragEnd}
      />

      <div
        className='p-6'
        style={{
          height: 'calc(100% - 120px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Image container with dynamic scaling */}
        <div
          className='flex-1 flex justify-center items-center mb-4'
          style={{
            minHeight: '200px',
            overflow: 'hidden',
          }}
        >
          <img
            src={plantData.image}
            alt='Tree'
            className='w-full h-full object-contain rounded-lg'
          />
        </div>

        {/* Details container - fixed position below image */}
        <div className='space-y-1 flex flex-col items-start'>
          {(status === 'PENDING' || status === 'REJECTED') && (
            <h3
              className='text-base font-bold w-full text-left'
              style={{ color: appTheme.primaryPalette.black }}
            >
              {plantData.species.common_name}
            </h3>
          )}
          {status === 'FAILED' && (
            <h3
              className='text-base font-bold w-full text-left'
              style={{ color: appTheme.primaryPalette.black }}
            >
              {botanical_name}
            </h3>
          )}
          {(status === 'PLANTED' || status === 'APPROVED') && (
            <div className='w-full flex flex-row items-center gap-1 text-left'>
              <span
                className='font-base text-sm'
                style={{
                  color: appTheme.secondaryPalette.slateGray,
                }}
              >
                {`${plantData.latitude}, ${plantData.longitude}`}
              </span>
            </div>
          )}
          <div className='flex flex-row items-center gap-1'>
            <span
              className='font-base text-sm'
              style={{
                color: appTheme.primaryPalette.black,
              }}
            >
              {getDateText(
                status,
                plantData.created_at || plantData.captured_at
              )}
            </span>
            {status !== 'PLANTED' && status !== 'APPROVED' && (
              <>
                {' '}
                <span
                  className='text-sm'
                  style={{
                    color: appTheme.secondaryPalette.slateGray,
                    opacity: '30%',
                  }}
                >
                  |
                </span>
                <span
                  className='font-base text-sm'
                  style={{
                    color: appTheme.secondaryPalette.slateGray,
                  }}
                >
                  {`${plantData.latitude}, ${plantData.longitude}`}
                </span>
              </>
            )}
          </div>
          <span
            className='font-normal text-sm'
            style={{
              color:
                status === 'PENDING' || status === 'FAILED'
                  ? appTheme.secondaryPalette.orange
                  : appTheme.secondaryPalette.darkRed,
            }}
          >
            {getStatusText(status)}
          </span>
        </div>
      </div>
    </div>
  );
};
