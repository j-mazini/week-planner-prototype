import { describe, it, expect, vi } from 'vitest';
import { createReentrancyGuard } from './submit-guard';

/** Promise resolvível manualmente, para controlar o "tempo" da ação assíncrona. */
function deferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('createReentrancyGuard', () => {
  it('executa a ação quando não há nada em andamento', async () => {
    const guard = createReentrancyGuard();
    const result = await guard.run(() => 42);
    expect(result).toBe(42);
  });

  it('descarta o segundo clique enquanto o primeiro está em andamento (double-submit)', async () => {
    const guard = createReentrancyGuard();
    const d = deferred();
    const action = vi.fn(() => d.promise); // ação que fica pendente até o teste resolver

    // Primeiro clique inicia a ação (fica pendente)
    const first = guard.run(action);
    // Segundo clique no mesmo tick: deve ser ignorado, sem chamar a action de novo
    const second = await guard.run(action);

    expect(second).toBeUndefined();
    expect(action).toHaveBeenCalledTimes(1);

    // Conclui a primeira ação
    d.resolve(undefined);
    await first;
  });

  it('libera a trava após concluir, permitindo nova execução', async () => {
    const guard = createReentrancyGuard();
    const action = vi.fn(async () => 'ok');

    await guard.run(action);
    await guard.run(action);

    expect(action).toHaveBeenCalledTimes(2);
    expect(guard.isLocked()).toBe(false);
  });

  it('libera a trava mesmo quando a ação lança erro', async () => {
    const guard = createReentrancyGuard();
    await expect(
      guard.run(async () => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');
    expect(guard.isLocked()).toBe(false);
    // após o erro, uma nova execução deve funcionar
    const result = await guard.run(() => 'recovered');
    expect(result).toBe('recovered');
  });

  it('notifica onBusyChange com true ao iniciar e false ao terminar', async () => {
    const onBusyChange = vi.fn();
    const guard = createReentrancyGuard(onBusyChange);
    await guard.run(async () => 'done');
    expect(onBusyChange.mock.calls).toEqual([[true], [false]]);
  });

  it('isLocked reflete o estado durante a ação', async () => {
    const guard = createReentrancyGuard();
    const d = deferred();
    const running = guard.run(() => d.promise);
    expect(guard.isLocked()).toBe(true);
    d.resolve(undefined);
    await running;
    expect(guard.isLocked()).toBe(false);
  });

  it('chama onBlocked quando um clique reentrante é descartado', async () => {
    const onBlocked = vi.fn();
    const guard = createReentrancyGuard(undefined, onBlocked);
    const d = deferred();

    const first = guard.run(() => d.promise); // mantém a trava ativa
    await guard.run(() => 'segundo'); // reentrante → descartado

    expect(onBlocked).toHaveBeenCalledTimes(1);

    d.resolve(undefined);
    await first;
  });

  it('não chama onBlocked quando não há reentrância', async () => {
    const onBlocked = vi.fn();
    const guard = createReentrancyGuard(undefined, onBlocked);
    await guard.run(() => 'a');
    await guard.run(() => 'b'); // sequencial, não concorrente
    expect(onBlocked).not.toHaveBeenCalled();
  });
});
