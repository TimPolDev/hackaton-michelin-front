import polyline from '@mapbox/polyline';

interface Activity {
  id: string;
  bikeType: string;
  activityDate: string;
  distance: number;
  elevationGain: number;
  movingTime: number;
  polyline?: string;
  startLatitude?: number;
  startLongitude?: number;
}

/**
 * Convert an activity with polyline to GPX format
 */
export function activityToGPX(activity: Activity, ambassadorName?: string): string {
  if (!activity.polyline) {
    throw new Error('Activity has no GPS trace');
  }

  // Decode polyline to coordinates
  const coordinates = polyline.decode(activity.polyline);

  // Activity type mapping
  const activityType = activity.bikeType === 'ROAD' ? 'Cyclisme Route' :
                       activity.bikeType === 'MTB' ? 'VTT' :
                       activity.bikeType === 'GRAVEL' ? 'Gravel' :
                       'Cyclisme';

  const activityName = ambassadorName
    ? `${activityType} - ${ambassadorName}`
    : activityType;

  const activityDate = new Date(activity.activityDate).toISOString();

  // Build GPX XML
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1"
     creator="PaceLine - Michelin"
     xmlns="http://www.topografix.com/GPX/1/1"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${activityName}</name>
    <desc>Distance: ${activity.distance.toFixed(2)} km | Dénivelé: ${Math.round(activity.elevationGain)} m</desc>
    <time>${activityDate}</time>
  </metadata>
  <trk>
    <name>${activityName}</name>
    <type>${activityType}</type>
    <trkseg>
${coordinates.map(([lat, lng]) => `      <trkpt lat="${lat}" lon="${lng}">
        <ele>0</ele>
      </trkpt>`).join('\n')}
    </trkseg>
  </trk>
</gpx>`;

  return gpx;
}

/**
 * Download GPX file for an activity
 */
export function downloadGPX(activity: Activity, ambassadorName?: string): void {
  try {
    const gpxContent = activityToGPX(activity, ambassadorName);

    // Create blob
    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Generate filename
    const date = new Date(activity.activityDate).toISOString().split('T')[0];
    const type = activity.bikeType.toLowerCase();
    const filename = `${date}_${type}_${ambassadorName?.toLowerCase().replace(/\s+/g, '_') || 'activite'}.gpx`;

    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading GPX:', error);
    alert('Erreur lors du téléchargement de la trace GPS');
  }
}
