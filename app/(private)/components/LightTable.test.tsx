import React from 'react';
import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LightTable } from '@/components/ui/light-table';

afterEach(cleanup);
it('keeps sortable column names visible and toggles the displayed row order', () => {
  render(<LightTable data={[{name:'Zoe'}, {name:'Ana'}]} columns={[{id:'name', header:'Driver', accessor:'name', sortable:true}]} />);
  const header = screen.getByRole('button', { name: 'Driver' });
  fireEvent.click(header);
  expect(screen.getAllByRole('cell').map(cell => cell.textContent)).toEqual(['Ana','Zoe']);
  expect(screen.getByRole('columnheader').getAttribute('aria-sort')).toBe('ascending');
  fireEvent.click(header);
  expect(screen.getAllByRole('cell').map(cell => cell.textContent)).toEqual(['Zoe','Ana']);
  expect(screen.getByRole('columnheader').getAttribute('aria-sort')).toBe('descending');
});
