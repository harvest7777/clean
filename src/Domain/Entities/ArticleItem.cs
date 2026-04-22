namespace clean.Domain.Entities;

public class ArticleItem: BaseAuditableEntity
{

    // shoudl have title and content, lets keep ti as simple as possible
    // should have status which is articlestatus (in enum)
    // shoudl have a .publish() method which has some business ulres (title and content have to be not null to be published)
    // wait actually i notice that for this repo, they are very crud first, so no .publish method
    // but the setter for the status should runt he business rules checks
}
