import React from 'react';

const PercentageCard = ({ stats }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '0fr 7fr',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center'
      }}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          style={{
            backgroundColor: 'white',
            borderRadius: '4px',
            padding: '1rem',
            width: '8.8125rem',
            border: '1px solid #DFDFDF'
          }}
        >
          <div
            className='flex flex-row justify-between fw-semibold'
            style={{
              alignItems: 'end'
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '24px',
                  color: 'black'
                }}
              >
                {stat.count}
              </div>
              <div
                className='fw-medium'
                style={{
                  fontSize: '15px',
                  color: '#8494AC'
                }}
              >
                {stat.label}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PercentageCard;
