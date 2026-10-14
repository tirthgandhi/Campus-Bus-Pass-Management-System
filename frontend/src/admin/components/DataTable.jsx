import Icon from '../../common/components/Icon';

export default function DataTable({
  columns,
  data,
  keyField = 'id',
  emptyMessage = 'No records found.',
  emptySubtitle = 'Try adjusting your search or filters.',
  renderRow,
}) {
  if (!data || data.length === 0) {
    return (
      <div className="admin-table-container">
        <div className="admin-empty-state">
          <div className="admin-empty-icon" aria-hidden="true">
            <Icon name="search" size={26} />
          </div>
          <h3 className="admin-empty-title">{emptyMessage}</h3>
          <p className="admin-empty-subtitle">{emptySubtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-table-container">
      <div className="admin-table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th
                  key={col.key || index}
                  style={col.width ? { width: col.width } : undefined}
                  className={col.align ? `text-${col.align}` : ''}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) =>
              renderRow ? (
                renderRow(item, rowIndex)
              ) : (
                <tr key={item[keyField] || rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td
                      key={col.key || colIndex}
                      className={col.align ? `text-${col.align}` : ''}
                    >
                      {col.render ? col.render(item[col.key], item, rowIndex) : item[col.key]}
                    </td>
                  ))}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
