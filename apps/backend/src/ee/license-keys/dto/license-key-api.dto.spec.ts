import { ValidationPipe } from '@nestjs/common';
import {
  REPORT_RUN_KINDS,
  RunKind,
} from '../../../data-marts/services/project-billing/project-billing.service';
import { LicenseConsumptionRequestDto } from './license-key-api.dto';

describe('LicenseConsumptionRequestDto', () => {
  // Must stay in sync with setupGlobalPipes in src/config/global-pipes.config.ts.
  const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true });
  const metadata = { type: 'body' as const, metatype: LicenseConsumptionRequestDto };

  it.each(REPORT_RUN_KINDS)('accepts a forwarded %s consumption request', async kind => {
    await expect(
      pipe.transform({ kind, payload: { projectId: 'p-1', reportId: 'r-1' } }, metadata)
    ).resolves.toMatchObject({
      kind,
      payload: { projectId: 'p-1', reportId: 'r-1' },
    });
  });

  it('rejects an unknown kind', async () => {
    await expect(
      pipe.transform({ kind: 'NOT_A_RUN_KIND', payload: {} }, metadata)
    ).rejects.toThrow();
  });

  it.each([RunKind.CONNECTOR_RUN, RunKind.DATA_QUALITY_RUN, RunKind.AI_PROCESS_RUN])(
    'rejects the process run kind %s',
    async kind => {
      await expect(pipe.transform({ kind, payload: {} }, metadata)).rejects.toThrow();
    }
  );

  it('rejects a non-object payload', async () => {
    await expect(
      pipe.transform({ kind: RunKind.MCP_QUERY_RUN, payload: 'oops' }, metadata)
    ).rejects.toThrow();
  });
});
