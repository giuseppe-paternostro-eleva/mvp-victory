// -- REACT
import  { FC, JSX } from 'react'
// -- COMPONENTS
import Select from '../select/CustomSelect'
// -- STYLE
import './forecast-toolbar.scss'
// -- TYPES
import { forecastToolbarProps } from './forecast-toolbar'

export const ForecastToolbar: FC<forecastToolbarProps> = ({ selects }): JSX.Element => {
  return (
    <div className="forecastToolbar">
      {selects.map((select, idx) => {
        const shouldRender = select.options.length > 0;
        const isDisabled = select.options.length === 1;

        return shouldRender ? (
          <Select
            key={`${select.label}-${idx}`}
            label={select.label}
            value={select.value}
            options={select.options}
            setValue={select.setValue}
            disabled={isDisabled}
          />
        ) : null;
      })}
    </div>
  );
};
