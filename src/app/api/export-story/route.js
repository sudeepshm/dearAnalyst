import { NextResponse } from 'next/server';
import { generateStandaloneHtml } from '@/utils/htmlReportGenerator';

export async function POST(request) {
  try {
    const body = await request.json();
    const { storyTitle, slides, globalSettings, exportType } = body;

    if (!slides || slides.length === 0) {
      return NextResponse.json({ error: 'No story pages to export' }, { status: 400 });
    }

    if (exportType === 'json') {
      const exportData = {
        meta: {
          generator: 'dearAnalyst Studio',
          version: '1.0.0',
          exportedAt: new Date().toISOString(),
          title: storyTitle || 'Market Analysis Story',
        },
        globalSettings: globalSettings || {},
        slides,
      };

      return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${(storyTitle || 'dearAnalyst_Story').replace(/\s+/g, '_')}.json"`,
        },
      });
    }

    // Default: Standalone interactive HTML report
    const htmlContent = generateStandaloneHtml({
      title: storyTitle || 'dearAnalyst Financial Story',
      slides,
      globalSettings: globalSettings || {},
    });

    return new Response(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${(storyTitle || 'dearAnalyst_Story').replace(/\s+/g, '_')}.html"`,
      },
    });
  } catch (error) {
    console.error('Error generating export:', error);
    return NextResponse.json(
      { error: 'Export failed: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
