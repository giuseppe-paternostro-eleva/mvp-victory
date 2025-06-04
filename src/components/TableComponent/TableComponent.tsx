// -- REACT
import { FC, JSX, useEffect, useState } from "react";
// -- STYLES
import "./table-component.scss";
// -- SERVICE
import { fetchForecastTable } from "../../api/fetchForecastTable";
// -- ICONS
import { ArrowUp, ArrowDown, Equal } from "lucide-react";

const getIconComponent = (icon: string, color: string) => {
  switch (icon) {
    case "arrow-up":
      return <ArrowUp color={color} size={14} />;
    case "arrow-down":
      return <ArrowDown color={color} size={14} />;
    case "equals":
      return <Equal color={color} size={14} />;
    default:
      return null;
  }
};

type dataTableType = {
  columns: columnType[];
  rows: rowType[];
  tableType: string;
};

type columnType = {
  key: string;
  title: string;
  subTitle: string | string[];
  children?: columnType[];
};

type rowType = {
    key:string;
    piazza:string;
    previsione3Mesi: {
      label: string;
      icon: string;
      iconColor: string;
      range: string;
    };
    previsioniPrezzoMedio: {
      [key: string]: {
        arete: string;
        off: string;
      };
    };
    prezzoMedioCampagna:string;
    piazzaTooltip:string;
    [key: string]: any; 
  };


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
            {dataTable?.columns?.map((col, idx) =>
              col?.key === "previsioniPrezzoMedio" ? (
                <th key={idx} colSpan={3}>
                  <div className="th-title">
                    <h2>{col.title}</h2>
                    <div className="th-extratitle">
                      {col.subtitle.map((sub: string, key: number) => (
                        <h6 key={key}>{sub}</h6>
                      ))}
                    </div>
                  </div>
                </th>
              ) : (
                <th key={idx} rowSpan={2}>
                  <div className="th-title">
                    <h2>{col.title}</h2>
                  </div>
                  <div className="th-subtitle">{col.subTitle}</div>
                </th>
              )
            )}
          </tr>
          <tr>
            {dataTable?.columns
              ?.find((col) => col.key === "previsioniPrezzoMedio")
              ?.children?.map((child, idx) => (
                <th key={idx}>
                  <div className="th-title">
                    <h3>{child.title}</h3>
                  </div>
                  <div className="th-subtitle">{child.subTitle}</div>
                </th>
              ))}
          </tr>
        </thead>

        <tbody>
          {dataTable?.rows?.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {dataTable.columns
                .map((col) => {
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
                  } else if (key === "previsioniPrezzoMedio") {
                    // <-- QUI TORNA UN ARRAY DI 3 <td>
                    const previsioni = row[key];
                    return (
                      dataTable?.columns
                        ?.find((c) => c.key === "previsioniPrezzoMedio")
                        ?.children?.map((child, childIdx) => {
                          const periodoKey = child.key;
                          const valori = previsioni[periodoKey];
                          return (
                            <td key={periodoKey}>
                              <div className="arete">{valori?.arete}</div>
                              <div className="off">{valori?.off}</div>
                            </td>
                          );
                        }) ?? []
                    );
                  } else {
                    return <td key={key}>{row[key]}</td>;
                  }
                })
                .flat()}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
