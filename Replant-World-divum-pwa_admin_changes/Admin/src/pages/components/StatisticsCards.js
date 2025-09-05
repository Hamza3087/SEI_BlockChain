import React, { useState } from 'react';

const StatisticsCards = ({
  stats,
  onCardClick,
  isPeopleAndOrganization,
  activeCard
}) => {
  const [activeIndex, setActiveIndex] = useState(activeCard || 0);

  const handleCardClick = (index) => {
    if (stats[index].isDisabled) return;
    
    // Prevent API call if clicking on the same card that's already active
    if (activeIndex === index) return;

    setActiveIndex(index);
    if (onCardClick) {
      onCardClick(index);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        alignItems: 'center',
        width: '100%'
        // justifyContent: "space-between",
      }}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          style={{
            backgroundColor: stat.bgColor,
            borderRadius: '14px',
            padding: '1rem',
            // width: isPeopleAndOrganization ? '25.5rem' : '13.1875rem',
            // height: !isPeopleAndOrganization && '6.625rem',
            width: isPeopleAndOrganization ? '32%' : 'calc(16% - 0.75rem)',
            minWidth: '200px',
            height: 'auto',
            minHeight: '6.625rem',
            cursor: stat.isDisabled ? 'not-allowed' : 'pointer',
            pointerEvents: stat.isDisabled ? 'none' : 'auto',
            border:
              activeIndex === index
                ? `2px solid ${stat.activeBorderColor}`
                : '2px solid transparent',
            flexGrow: 1
            // '@media (max-width: 1024px)': {
            //   width: isPeopleAndOrganization ? '48%' : 'calc(24% - 0.75rem)'
            // },
            // '@media (max-width: 768px)': {
            //   width: isPeopleAndOrganization ? '100%' : 'calc(48% - 0.75rem)'
            // }
          }}
          onClick={() => handleCardClick(index)}
        >
          <div
            className='flex flex-row justify-between'
            style={{
              alignItems: 'end'
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: '500',
                  color: 'black'
                }}
              >
                {stat.count}
              </div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: '400',
                  color: 'black'
                }}
              >
                {stat.label}
              </div>
            </div>
            {stat?.icon && (
              <img
                src={stat.icon}
                alt=''
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards;
