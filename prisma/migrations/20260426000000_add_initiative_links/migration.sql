-- Add optional links to AI initiatives: code/explanation + deployed version

ALTER TABLE "AiInitiative" ADD COLUMN "resourceUrl" TEXT;
ALTER TABLE "AiInitiative" ADD COLUMN "deploymentUrl" TEXT;
