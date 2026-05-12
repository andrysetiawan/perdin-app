import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DataTable, type Column } from '../DataTable';

interface TestItem {
  id: string;
  name: string;
  email: string;
}

const columns: Column<TestItem>[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
];

const data: TestItem[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
];

describe('DataTable', () => {
  it('renders column headers', () => {
    render(
      <DataTable columns={columns} data={data} keyExtractor={(item) => item.id} />
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(
      <DataTable columns={columns} data={data} keyExtractor={(item) => item.id} />
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
  });

  it('shows empty message when data is empty', () => {
    render(
      <DataTable columns={columns} data={[]} keyExtractor={(item) => item.id} />
    );
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('shows custom empty message', () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        keyExtractor={(item) => item.id}
        emptyMessage="No users found"
      />
    );
    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('calls onRowClick when a row is clicked', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        keyExtractor={(item) => item.id}
        onRowClick={onRowClick}
      />
    );
    await user.click(screen.getByText('Alice'));
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });

  it('supports custom render function for columns', () => {
    const customColumns: Column<TestItem>[] = [
      {
        key: 'name',
        header: 'Name',
        render: (item) => <strong>{item.name}</strong>,
      },
    ];
    render(
      <DataTable
        columns={customColumns}
        data={data}
        keyExtractor={(item) => item.id}
      />
    );
    const strong = screen.getByText('Alice');
    expect(strong.tagName).toBe('STRONG');
  });

  it('has overflow-x-auto for horizontal scroll on mobile', () => {
    const { container } = render(
      <DataTable columns={columns} data={data} keyExtractor={(item) => item.id} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('overflow-x-auto');
  });
});
