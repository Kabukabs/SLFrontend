import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DeleteAccountModal from './DeleteAccountModal';

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }));

describe('DeleteAccountModal', () => {
  it('renders nothing when closed', () => {
    render(<DeleteAccountModal open={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
