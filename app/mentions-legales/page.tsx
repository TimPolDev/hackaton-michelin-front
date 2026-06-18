export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-michelin-navy mb-2">Mentions légales</h1>
        <p className="text-muted-foreground mb-10">Dernière mise à jour : juin 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-michelin-navy mb-3">1. Éditeur du site</h2>
            <p>
              Le site PaceLine est édité par la société <strong>PaceLine SAS</strong>, société par actions
              simplifiée au capital de 50 000 €, immatriculée au Registre du Commerce et des Sociétés de
              Clermont-Ferrand sous le numéro 912 345 678, dont le numéro SIRET est le 912 345 678 00017.
            </p>
            <p className="mt-2">
              Siège social : 15 rue du Pré la Reine, 63100 Clermont-Ferrand, France.<br />
              Téléphone : +33 4 73 00 00 00<br />
              Email : contact@paceline.app<br />
              N° TVA intracommunautaire : FR 76 912345678
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-michelin-navy mb-3">2. Directeur de la publication</h2>
            <p>
              Le directeur de la publication est le représentant légal de PaceLine SAS.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-michelin-navy mb-3">3. Hébergement</h2>
            <p>
              Le site PaceLine est hébergé par <strong>Vercel Inc.</strong>, 340 Pine Street, Suite 700,
              San Francisco, CA 94104, États-Unis.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-michelin-navy mb-3">4. Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble des contenus présents sur le site PaceLine (textes, images, logos, graphismes,
              icônes, etc.) sont la propriété exclusive de PaceLine SAS ou de ses partenaires et sont protégés par
              les lois françaises et internationales relatives à la propriété intellectuelle. La marque et les
              produits Michelin référencés sur la plateforme demeurent la propriété de leurs titulaires respectifs.
            </p>
            <p className="mt-2">
              Toute reproduction, représentation, modification, publication ou transmission, totale ou partielle,
              sans l&apos;accord préalable et écrit de PaceLine SAS est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-michelin-navy mb-3">5. Données personnelles</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique
              et Libertés, vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement et de portabilité
              de vos données personnelles.
            </p>
            <p className="mt-2">
              Pour exercer ces droits ou pour toute question relative au traitement de vos données, vous pouvez
              contacter notre délégué à la protection des données à l&apos;adresse : dpo@paceline.app.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-michelin-navy mb-3">6. Cookies</h2>
            <p>
              Le site PaceLine utilise des cookies nécessaires au fonctionnement de la plateforme (authentification,
              préférences) ainsi que des cookies analytiques pour améliorer l&apos;expérience utilisateur. Vous pouvez
              paramétrer vos préférences de cookies depuis les paramètres de votre compte.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-michelin-navy mb-3">7. Limitation de responsabilité</h2>
            <p>
              PaceLine s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations publiées sur la plateforme.
              PaceLine se réserve le droit de corriger le contenu à tout moment sans préavis. Toutefois, PaceLine
              ne peut garantir l&apos;exactitude, la précision ou l&apos;exhaustivité des informations mises à disposition.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-michelin-navy mb-3">8. Droit applicable</h2>
            <p>
              Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux
              français seront seuls compétents.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
