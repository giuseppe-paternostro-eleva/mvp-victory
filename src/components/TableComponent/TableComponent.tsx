// -- REACT
import { FC, JSX, useEffect, useState } from "react";
// -- STYLES
import "./table-component.scss";
// -- SERVICE
import { fetchForecastTable } from "../../api/fetchForecastTable";
// -- ICONS
import { ArrowUp, ArrowDown, ArrowRight } from "lucide-react";


const getIconComponent = (icon: string, color: string) => {
  switch (icon) {
    case "arrow-up":
      return <ArrowUp color={color} size={14} />;
    case "arrow-down":
      return <ArrowDown color={color} size={14} />;
    case "arrow-right":
      return <ArrowRight color={color} size={14} />;
    default:
      return null;
  }
};

type dataTableType = {
    columns:columnType[];
    rows:any[]
    tableType:string;
}

type columnType = {
    key: string;
    title: string;
    subTitle: string;
}

export const TableComponent: FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [dataTable, setDataTable] = useState<dataTableType | null>(null);

    useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        setError(false);

        const res = await fetchForecastTable("mais", "forecast");
        console.log("🚀 ~ fetchData ~ res:", res);
        setDataTable(res);
      } catch (error) {
        setError(true);
        console.error("Errore nella chiamata o parsing:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  return (
    <div className="forecast-table">
      <table>
        <thead>
          <tr>
            {dataTable?.columns?.map((col, idx) => (
              <th key={idx}>
                <div className="th-title">{col.title}</div>
                <div className="th-subtitle">{col.subTitle}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataTable?.rows?.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {dataTable.columns.map((col) => {
                const key = col.key;
                if (key === "previsione3Mesi") {
                  const val = row[key];
                  return (
                    <td key={key} className="forecast-cell">
                      {val?.label && <div className="label">{val.label}</div>}
                      {val?.icon && (
                        <div className="icon">
                          {getIconComponent(val.icon, val.iconColor)}
                        </div>
                      )}
                      {val?.range && <div className="range">{val.range}</div>}
                    </td>
                  );
                } else {
                  return <td key={key}>{row[key]}</td>;
                }
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
