import { subscriptionCompanies } from "../../../subscribe/preferences";
import { EmailLink } from "../email-link";

export default function ManagePage() {
  return <EmailLink mode="manage" companies={subscriptionCompanies()} />;
}
