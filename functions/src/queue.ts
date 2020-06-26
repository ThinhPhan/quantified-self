import { ServiceNames } from '@sports-alliance/sports-lib/lib/meta-data/meta-data.interface';
import * as admin from 'firebase-admin';
import { processSuuntoAppActivityQueueItem } from './suunto/parse-queue';
import { processGarminHealthAPIActivityQueueItem } from './garmin/queue';
import {
  GarminHealthAPIActivityQueueItemInterface,
  QueueItemInterface,
  SuuntoAppWorkoutQueueItemInterface
} from './queue/queue-item.interface';
export const TIMEOUT_IN_SECONDS = 540;
export const MEMORY = "2GB";

export async function increaseRetryCountForQueueItem(queueItem: QueueItemInterface, serviceName: ServiceNames, error: Error, incrementBy = 1) {
  queueItem.retryCount += incrementBy;
  queueItem.totalRetryCount = (queueItem.totalRetryCount + incrementBy) || incrementBy;
  queueItem.errors = queueItem.errors || [];
  queueItem.errors.push({
    error: error.message,
    atRetryCount: queueItem.totalRetryCount,
    date: (new Date()).getTime(),
  });

  try {
    await  await admin.firestore()
      .collection(serviceName === ServiceNames.SuuntoApp ? 'suuntoAppWorkoutQueue' : 'garminHealthAPITokens')
      .doc(queueItem.id).update(JSON.parse(JSON.stringify(queueItem)));
    console.info(`Updated retry count for ${queueItem.id} to ${queueItem.retryCount + incrementBy}`);
  } catch (e) {
    console.error(new Error(`Could not update retry count on ${queueItem.id}`))
  }
}

export async function updateToProcessed(queueItem: QueueItemInterface, serviceName: ServiceNames) {
  try {
    // @todo make switch
    await admin.firestore()
      .collection(serviceName === ServiceNames.SuuntoApp ? 'suuntoAppWorkoutQueue' : 'garminActivityQueue')
      .doc(queueItem.id).update({
        'processed': true,
        'processedAt': (new Date()).getTime(),
      })
    console.log(`Updated to processed  ${queueItem.id}`);
  } catch (e) {
    console.error(new Error(`Could not update processed state for ${queueItem.id}`));
  }
}

export async function parseQueueItems(serviceName: ServiceNames) {
  const RETRY_COUNT = 10;
  const LIMIT = 200;
  // @todo add queue item sort date for creation
  const collection = serviceName === ServiceNames.SuuntoApp ? 'suuntoAppWorkoutQueue' : 'garminActivityQueue';
  const querySnapshot = await admin.firestore().collection(collection).where('processed', '==', false).where("retryCount", "<", RETRY_COUNT).limit(LIMIT).get(); // Max 10 retries
  console.log(`Found ${querySnapshot.size} queue items to process`);
  let count = 0;
  for (const queueItem of querySnapshot.docs) {
    try {
      await (serviceName === ServiceNames.SuuntoApp
        ? processSuuntoAppActivityQueueItem(<SuuntoAppWorkoutQueueItemInterface>Object.assign({id:queueItem.id }, queueItem.data()))
        : processGarminHealthAPIActivityQueueItem(Object.assign({id: queueItem.id}, <GarminHealthAPIActivityQueueItemInterface>queueItem.data())));
      count++;
      console.log(`Parsed queue item ${count}/${querySnapshot.size} and id ${queueItem.id}`)
    } catch (e) {
      console.error(e);
      console.error(new Error(`Error parsing queue item #${count} of ${querySnapshot.size} and id ${queueItem.id}`))
    }
  }
  console.log(`Parsed ${count} queue items out of ${querySnapshot.size}`);
}
