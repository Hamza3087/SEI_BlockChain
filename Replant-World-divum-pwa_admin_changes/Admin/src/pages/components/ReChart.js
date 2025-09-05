import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const ReChart = ({ title, amount, unit, data }) => {
  const iucnColorPalette = {
    'Critically Endangered': '#F3ADCC',
    Endangered: '#00BDA4',
    Vulnerable: '#B5AEF9',
    'Near Threatened': '#DDDDDD',
    'Data Deficient': '#C6F588',
    'Least Concern': '#F5DB88'
  };

  // Predefined colors for species mix
  const speciesMixColors = [
    '#F3ADCC', // Pink
    '#00BDA4', // Teal
    '#B5AEF9', // Purple
    '#F5DB88', // Light Orange
    '#C6F588', // Light Green
    '#FF7886' // Coral
  ];

  // Determine if we're dealing with IUCN data or species mix
  const isIucnData = useMemo(() => {
    if (!data) return false;
    // Check if any of the keys match IUCN status categories
    return Object.keys(data)?.some((key) =>
      Object.keys(iucnColorPalette).includes(key)
    );
  }, [data]);

  // Format data for recharts
  const formattedData = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return [];

    return Object.entries(data).map(([name, value], index) => {
      let color;

      if (isIucnData) {
        // Use specific IUCN colors
        color = iucnColorPalette[name] || '#DDDDDD';
      } else {
        // For species mix, use a color from our predetermined list
        color = speciesMixColors[index % speciesMixColors?.length];
      }

      return {
        name: `${name} ${value}%`,
        value: value,
        color: color
      };
    });
  }, [data, isIucnData]);

  // Check if data is empty
  const isEmpty = !data || Object.keys(data).length === 0;

  return (
    <div
      className='bg-white'
      style={{
        maxWidth: '530px',
        borderRadius: '4px',
        padding: '1rem',
        border: '1px solid #DFDFDF',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}
    >
      {/* Left column with title and amount */}
      <div
        style={{ display: 'flex', flexDirection: 'column', minWidth: '100px' }}
      >
        <span
          className='fw-semibold'
          style={{
            fontSize: '24px',
            color: 'black',
            whiteSpace: 'nowrap'
          }}
        >
          {amount}{' '}
          <span
            className='fw-normal'
            style={{ fontSize: '16px', color: 'black' }}
          >
            {unit}
          </span>
        </span>
        <span
          className='fw-medium'
          style={{
            fontSize: '14px',
            color: '#8494AC',
            marginTop: '1px'
          }}
        >
          {title}
        </span>
      </div>

      {/* Center column with chart */}
      <div style={{ width: '160px', height: '160px' }}>
        {isEmpty ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2C3E50',
              fontSize: '18px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            No Matching Results found!
          </div>
        ) : (
          <ResponsiveContainer
            width='100%'
            height='100%'
          >
            <PieChart>
              <Pie
                data={formattedData}
                cx='50%'
                cy='50%'
                innerRadius={35}
                outerRadius={65}
                paddingAngle={1}
                dataKey='value'
                startAngle={90}
                endAngle={-270}
              >
                {formattedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke='none'
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Right column with legend */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          maxHeight: '160px',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          paddingRight: '8px'
        }}
      >
        {isEmpty ? null : (
          formattedData.map((entry, index) => (
            <div
              key={index}
              style={{ display: 'flex', alignItems: 'center', minHeight: '16px' }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: entry.color,
                  marginRight: '8px',
                  flexShrink: 0
                }}
              />
              <span
                className='fw-normal'
                style={{
                  fontSize: '13px',
                  whiteSpace: 'nowrap',
                  color: 'black',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {entry.name}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReChart;
