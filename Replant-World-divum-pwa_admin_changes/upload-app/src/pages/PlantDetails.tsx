import React, { useState } from 'react';
import { appTheme } from 'plugins/appTheme';
import { DetailsCard, TreeItem } from 'common/components';
import { PreviewPanel } from './PreviewPanel';

interface PlantDetailsProps {
  onClose: () => void;
  title: string;
  count: number;
  status: string;
}
export const PlantDetails: React.FC<PlantDetailsProps> = ({
  onClose,
  title,
  count,
  status,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTree, setSelectedTree] = useState<TreeItem | null>(null);
  const [showDetailsCard, setShowDetailsCard] = useState(true);

  const handlePreview = (tree: TreeItem) => {
    setSelectedTree(tree);
    setShowPreview(true);
    setShowDetailsCard(false);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setSelectedTree(null);
    setShowDetailsCard(true);
  };
  return (
    <div className='absolute inset-0 z-30'>
      <div
        className='absolute inset-0 flex items-end justify-center z-50 opacity-40'
        style={{
          backgroundColor: appTheme.primaryPalette.black,
        }}
        onClick={onClose}
      ></div>
      {showPreview && selectedTree ? (
        <div
          className='absolute inset-0 flex items-end justify-center'
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <PreviewPanel
            status={status}
            plant={selectedTree}
            onClose={handleClosePreview}
          />
        </div>
      ) : (
        showDetailsCard && (
          <div
            className='absolute inset-0 flex items-end justify-center'
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <DetailsCard
              onPreview={handlePreview}
              title={title}
              count={count}
              onClose={onClose}
              status={status}
            />
          </div>
        )
      )}
    </div>
  );
};
