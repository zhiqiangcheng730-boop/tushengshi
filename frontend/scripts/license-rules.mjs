const allowedLicenses = new Set([
  "0BSD",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "MIT",
]);
const emptyReportMessage = "No licenses in packages found";

export function assertAllowedLicenses(reportSource) {
  const normalizedReport = reportSource.trim();
  if (normalizedReport === "" || normalizedReport === emptyReportMessage)
    return;

  const report = JSON.parse(normalizedReport);
  const rejectedLicenses = Object.keys(report).filter(
    (license) => !allowedLicenses.has(license),
  );

  if (rejectedLicenses.length > 0) {
    throw new Error(
      `Production dependencies use unapproved licenses: ${rejectedLicenses.join(", ")}`,
    );
  }
}
