import React from 'react';
import './custom-select.scss';
import { ToolbarSelect } from '../forecastToolbar/forecast-toolbar';

export type Option = {
  value: string;
  label: string;
};


const Select: React.FC<ToolbarSelect> = ({ value, setValue, options, label }) => {
  return (
    <div className="select-wrapper">
      {label && <label className="select-label">{label}</label>}
      <select
        className="custom-select"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;