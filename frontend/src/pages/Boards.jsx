import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, Squares2X2Icon, UsersIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CreateBoardModal from '../components/CreateBoardModal';

function Boards() {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const response = await api.get('/boards');
      setBoards(response.data.data.boards || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch boards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreate = async (payload) => {
    try {
      const response = await api.post('/boards', payload);
      setBoards((prev) => [response.data.data.board, ...prev]);
      toast.success('Board created');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create board');
      throw error;
    }
  };

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-lg border-2 border-foreground bg-quaternary p-6 text-foreground shadow-[7px_7px_0_#8B5CF6] sm:p-8">
          <span className="shape shape-circle -right-8 -top-12 h-36 w-36 bg-secondary" aria-hidden="true" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/70">Kanban boards</p>
              <h1 className="qp-heading mt-2 text-4xl tracking-tight sm:text-5xl">Your boards, {user?.name}</h1>
              <p className="mt-2 max-w-2xl text-sm font-medium text-foreground/75 sm:text-base">
                Pick a board to drag, drop, and manage work with your team.
              </p>
            </div>
            <button type="button" onClick={() => setModalOpen(true)} className="qp-button gap-2 px-5 py-3 text-sm">
              <PlusIcon className="h-5 w-5" strokeWidth={2.5} />
              New board
            </button>
          </div>
        </section>

        <section className="mt-8">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-40 animate-pulse rounded-md border border-border bg-surface p-5 shadow-xs" />
              ))}
            </div>
          ) : boards.length === 0 ? (
            <div className="grid place-items-center rounded-lg border border-dashed border-border-strong bg-surface p-12 text-center shadow-xs sm:p-16">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-md bg-accent-muted text-accent">
                <Squares2X2Icon className="h-10 w-10" strokeWidth={1.5} />
              </div>
              <h3 className="qp-heading text-3xl text-foreground">No boards yet</h3>
              <p className="mt-2 max-w-md text-sm text-foreground-muted">
                Create your first board to start organizing tasks into columns you control.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {boards.map((board, index) => (
                <Link
                  key={board._id}
                  to={`/boards/${board._id}`}
                  className={`qp-card qp-card-interactive block p-5 shadow-[6px_6px_0_#F3E8FF] ${
                    index % 2 ? 'sm:translate-y-2' : ''
                  }`}
                >
                  <div className="mb-3 inline-flex rounded-full border-2 border-foreground bg-accent p-3 text-white shadow-xs">
                    <Squares2X2Icon className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <h3 className="line-clamp-1 font-heading text-xl font-extrabold text-foreground">{board.name}</h3>
                  <p className="mt-1 line-clamp-2 min-h-10 text-sm text-foreground-muted">
                    {board.description || 'No description'}
                  </p>
                  <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-foreground-muted">
                    <UsersIcon className="h-4 w-4" />
                    {board.members?.length || 1} member{board.members?.length === 1 ? '' : 's'}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <CreateBoardModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
    </div>
  );
}

export default Boards;
