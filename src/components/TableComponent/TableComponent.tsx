// -- REACT
import { FC, JSX, useEffect, useState } from "react";
// -- STYLES
import "./table-component.scss";
// -- SERVICE
import { fetchForecastTable } from "../../api/fetchForecastTable";
// -- ICONS
import { ArrowUp, ArrowDown, Equal } from "lucide-react";
import { isArray } from "lodash";

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
  key: string;
  piazza: string;
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
  prezzoMedioCampagna: string;
  piazzaTooltip: string;
  [key: string]: any;
};

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
      <div className="head-table">
        {/* ROW 1: Titoli principali */}
        {dataTable?.columns?.flatMap((col, idx) => {
          if (col?.children) {
            return (
              <div className="head-cell title-cell has-children" key={idx}>
                <h2 className="title">{col.title}</h2>
                <div className="extra-title-container">
                  {Array.isArray(col?.subTitle) &&
                    col.subTitle.map((sub, i) => (
                      <h5 className="extra-title" key={i}>
                        {sub}
                      </h5>
                    ))}
                </div>
              </div>
            );
          } else {
            return (
              <div className="head-cell title-cell" key={idx}>
                <h2 className="title">{col.title}</h2>
                <div className="extra-title-container">
                  {Array.isArray(col?.subTitle) &&
                    col.subTitle.map((sub, i) => (
                      <h5 className="extra-title" key={i}>
                        {sub}
                      </h5>
                    ))}
                </div>
              </div>
            );
          }
        })}

        {/* ROW 2: Sottotitoli */}
        {dataTable?.columns?.flatMap((col, idx) => {
          if (col?.children) {
            return col.children.map((child, i) => (
              <div className="head-cell child-column" key={`${idx}-${i}`}>
                <h4>{child.title}</h4>
                <h6>{child.subTitle}</h6>
              </div>
            ));
          } else {
            return (
              <div className="head-cell subtitle-cell" key={idx}>
                <h4>{col.subTitle}</h4>
              </div>
            );
          }
        })}
      </div>
      <div className="body-table">
        {dataTable?.rows.map((row, rowIdx) => (
          <div className="body-row" key={rowIdx}>
            {/* Colonna 1: piazza */}
            <div className="body-cell">
              <span title={row.piazzaTooltip}>{row.piazza}</span>
            </div>

            {/* Colonna 2: prezzo medio campagna */}
            <div className="body-cell">{row.prezzoMedioCampagna}</div>

            {/* Colonna 3: ultimo prezzo */}
            <div className="body-cell">{row.ultimoPrezzo}</div>

            {/* Colonna 4: previsione 3 mesi */}
            <div className="body-cell forecast-cell">
              {row.previsione3Mesi?.label && (
                <div className="label">{row.previsione3Mesi.label}</div>
              )}
              {row.previsione3Mesi?.icon && (
                <div className="icon">
                  {getIconComponent(
                    row.previsione3Mesi.icon,
                    row.previsione3Mesi.iconColor
                  )}
                </div>
              )}
              {row.previsione3Mesi?.range && (
                <div className="range">{row.previsione3Mesi.range}</div>
              )}
            </div>

            {/* Colonne 5-7: previsioni prezzo medio (cc, mr, cs) */}
            {row.previsioniPrezzoMedio &&
              Object.entries(row.previsioniPrezzoMedio).map(([key, item], idx) => (
                <div className="body-cell" key={idx}>
                  <div className="arete">{item.arete}</div>
                  <div className="off">{item.off}</div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
};

