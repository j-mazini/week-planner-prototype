# StyledButton Component

## Overview

The `StyledButton` is a reusable button component that unifies the styling and animations of all buttons in the application. It replaces duplicate styles that were scattered across multiple CSS files.

## Basic Usage

```tsx
import { StyledButton } from '@/components/styled-button';

// Primary button
<StyledButton variant="primary" size="md" onClick={handleClick}>
  <i className="bi bi-plus-lg"></i> New
</StyledButton>

// Outline button
<StyledButton variant="outline-secondary" size="sm" onClick={handleClick}>
  Export
</StyledButton>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'outline-secondary'` | `'primary'` | Visual variant of the button |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `useBootstrap` | `boolean` | `false` | Whether to use Bootstrap classes for compatibility |
| `className` | `string` | - | Additional CSS classes |
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `children` | `React.ReactNode` | - | Button content |

## Animations

The component includes the following unified animations:

- **Hover**: Smooth elevation (`translateY(-2px)`) with shadow
- **Pulse**: Pulse animation on shadow when hovering
- **Ripple**: Ripple effect when clicking
- **Shine**: Shine effect when hovering
- **Active**: Reduced scale when clicking (`scale(0.98)`)

## Compatibility

The component is compatible with:
- **NewButton**: Updated to use `StyledButton` internally
- **ExportButton**: Updated to use `StyledButton` when using Bootstrap
- Bootstrap classes: Can be used with existing Bootstrap classes via `useBootstrap` prop

## Related Files

- **Component**: `Front/components/styled-button.tsx`
- **Styles**: `Front/styles/buttons.css`
- **Updated components**:
  - `Front/components/new-button.tsx`
  - `Front/components/export-button.tsx`

## Components That Use It

The following components have already been updated to use `StyledButton`:

- ✅ Vendor (via NewButton and ExportButton)
- ✅ Vehicles (via NewButton and ExportButton)
- ✅ Week Planner (via NewButton and ExportButton)
- ✅ Daily Operations Reports (via NewButton and ExportButton)
- ✅ Daily Financial Insights (via NewButton and ExportButton)
- ✅ Vendor Performance (via NewButton and ExportButton)
- ✅ Deductions Disbursements Recharges (via NewButton and ExportButton)
- ✅ Financial Invoices (via NewButton and ExportButton)

## Migration

To migrate existing buttons:

1. **Replace simple HTML buttons**:
   ```tsx
   // Before
   <button className="btn btn-primary">Click here</button>
   
   // After
   <StyledButton variant="primary" useBootstrap={true} className="btn btn-primary">
     Click here
   </StyledButton>
   ```

2. **Replace buttons with custom styles**:
   ```tsx
   // Before
   <button className="btn-primary custom-class">Click here</button>
   
   // After
   <StyledButton variant="primary" className="custom-class">
     Click here
   </StyledButton>
   ```

## Notes

- Duplicate CSS styles were removed from individual CSS files
- Animations are optimized for performance
- Support for `prefers-reduced-motion` for accessibility
- Compatible with Bootstrap when needed
